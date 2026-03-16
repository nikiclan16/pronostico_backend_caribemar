import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
dotenv.config();

// ─── Cliente ORIGEN (local, variables originales) ───────────────────────────
const createClientOrigen = () => {
  return new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT || 5432,
  });
};

// ─── Cliente DESTINO (jano_proxy) ────────────────────────────────────────────
const createClientDestino = () => {
  return new Client({
    user: "usrjanoproxy",
    host: "localhost",
    database: "jano_proxy",
    password: "Julio2019proxy",
    port: 5433,
  });
};

// ─── Construir INSERT dinámico para 24 periodos ──────────────────────────────
const buildInsertQuery = () => {
  const cols = ["ucp", "fecha"];
  const params = ["$1", "$2"];
  let idx = 3;

  for (let i = 1; i <= 24; i++) {
    cols.push(`p${i}_t`, `p${i}_h`, `p${i}_v`, `p${i}_i`);
    params.push(`$${idx}`, `$${idx + 1}`, `$${idx + 2}`, `$${idx + 3}`);
    idx += 4;
  }

  return `INSERT INTO datos_clima (${cols.join(", ")}) VALUES (${params.join(", ")})`;
};

// ─── Extraer valores de una fila en el orden correcto ────────────────────────
const extraerValores = (row) => {
  const valores = [row.ucp, row.fecha];
  for (let i = 1; i <= 24; i++) {
    valores.push(
      row[`p${i}_t`],
      row[`p${i}_h`],
      row[`p${i}_v`],
      row[`p${i}_i`],
    );
  }
  return valores;
};

// ─── Main ────────────────────────────────────────────────────────────────────
const main = async () => {
  const origen = createClientOrigen();
  const destino = createClientDestino();

  try {
    await origen.connect();
    console.log("✅ Conectado a la BD ORIGEN (local)");

    await destino.connect();
    console.log("✅ Conectado a la BD DESTINO (jano_proxy:5433)");

    // Leer TODAS las filas del origen
    console.log("\n📦 Leyendo datos_clima desde el origen...");
    const result = await origen.query(
      "SELECT * FROM datos_clima ORDER BY fecha, ucp",
    );
    const rows = result.rows;
    console.log(`📊 Total de filas a migrar: ${rows.length}`);

    if (rows.length === 0) {
      console.log("⚠️  No hay filas en la tabla origen. Nada que migrar.");
      return;
    }

    const insertQuery = buildInsertQuery();

    await destino.query("BEGIN");

    let insertados = 0;
    let actualizados = 0;
    let errores = 0;

    for (const row of rows) {
      try {
        await destino.query("SAVEPOINT sp1");

        // ¿Ya existe en destino?
        const existe = await destino.query(
          `SELECT 1 FROM datos_clima WHERE ucp = $1 AND fecha = $2`,
          [row.ucp, row.fecha],
        );

        if (existe.rowCount > 0) {
          // UPDATE: solo sobreescribe columnas con valor no nulo
          const setClauses = [];
          const updateVals = [row.ucp, row.fecha];
          let idx = 3;

          for (let i = 1; i <= 24; i++) {
            for (const sufijo of ["t", "h", "v", "i"]) {
              const col = `p${i}_${sufijo}`;
              if (row[col] !== null && row[col] !== undefined) {
                setClauses.push(`${col} = $${idx}`);
                updateVals.push(row[col]);
                idx++;
              }
            }
          }

          if (setClauses.length > 0) {
            await destino.query(
              `UPDATE datos_clima SET ${setClauses.join(", ")} WHERE ucp = $1 AND fecha = $2`,
              updateVals,
            );
          }
          actualizados++;
        } else {
          await destino.query(insertQuery, extraerValores(row));
          insertados++;
        }

        await destino.query("RELEASE SAVEPOINT sp1");
      } catch (err) {
        errores++;
        await destino.query("ROLLBACK TO SAVEPOINT sp1");
        console.error(
          `❌ Error en (ucp: ${row.ucp}, fecha: ${row.fecha}): ${err.message}`,
        );
      }

      // Log de progreso cada 500 filas
      if ((insertados + actualizados + errores) % 500 === 0) {
        console.log(
          `   ⏳ Procesadas: ${insertados + actualizados + errores} / ${rows.length}`,
        );
      }
    }

    await destino.query("COMMIT");

    console.log(`\n✅ Migración completada:`);
    console.log(`   - Insertados:   ${insertados}`);
    console.log(`   - Actualizados: ${actualizados}`);
    console.log(`   - Errores:      ${errores}`);
    console.log(`   - Total:        ${rows.length}`);
  } catch (err) {
    console.error("\n❌ Error general:", err);
    try {
      await destino.query("ROLLBACK");
    } catch (_) {}
  } finally {
    await origen.end();
    await destino.end();
    console.log("\n🔌 Conexiones cerradas");
  }
};

main();

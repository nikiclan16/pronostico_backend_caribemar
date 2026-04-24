import path from "path";
import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
dotenv.config();

// ─── CONFIGURACIÓN MANUAL ────────────────────────────────────────────────────
const UCP = "CordobaSucre"; // <-- Cambia esto
const ESTADO = "Tipico"; // <-- "Tipico" | "Atipico" | etc.
const FESTIVO = 0; // <-- 0 o 1
const OBSERVACION = ""; // <-- Texto libre o dejar vacío
// ─────────────────────────────────────────────────────────────────────────────

const createClient = () =>
  new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT || 5432,
  });

const parseFecha = (valor) => {
  if (!valor) return null;

  if (valor instanceof Date) {
    return isNaN(valor.getTime()) ? null : valor.toISOString().slice(0, 10);
  }

  const str = String(valor).trim();
  if (!str) return null;

  // yyyy/mm/dd
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) return str.replace(/\//g, "-");

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);

  // dd/mm/yyyy
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m)
    return `${m[3]}-${String(m[2]).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const parseNumero = (valor) => {
  if (valor === undefined || valor === null || valor === "") return 0;
  const n = parseFloat(String(valor).replace(",", "."));
  return isNaN(n) ? 0 : n;
};

const leerExcel = async (rutaArchivo) => {
  const XLSX = (await import("xlsx")).default;

  console.log(`\n📄 Leyendo Excel: ${rutaArchivo}`);

  const wb = XLSX.readFile(rutaArchivo, { cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    raw: false,
    dateNF: "yyyy/mm/dd",
  });

  const datos = [];

  for (const fila of filas) {
    if (!fila || fila.length === 0) continue;

    const posibleFecha = fila[0];
    if (!posibleFecha || String(posibleFecha).toLowerCase().includes("fecha"))
      continue;

    const fecha = parseFecha(posibleFecha);
    if (!fecha) {
      console.warn(`⚠️  Fecha inválida, saltando: "${posibleFecha}"`);
      continue;
    }

    const periodos = {};
    for (let i = 1; i <= 24; i++) {
      periodos[`p${i}`] = parseNumero(fila[i]); // B=1 .. Y=24
    }

    datos.push({ fecha, ...periodos });
  }

  console.log(`✅ Registros leídos: ${datos.length}`);
  return datos;
};

const insertarRegistros = async (registros) => {
  const client = createClient();

  // INSERT o UPDATE si ya existe el par (ucp, fecha)
  // codigo es autoincrement, no se toca en el conflicto
  const sql = `
    INSERT INTO actualizaciondatos (
      ucp, fecha,
      p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12,
      p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24,
      estado, observacion, festivo
    ) VALUES (
      $1, $2,
      $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
      $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
      $27, $28, $29
    )
    ON CONFLICT (ucp, fecha) DO UPDATE SET
      p1  = EXCLUDED.p1,  p2  = EXCLUDED.p2,  p3  = EXCLUDED.p3,
      p4  = EXCLUDED.p4,  p5  = EXCLUDED.p5,  p6  = EXCLUDED.p6,
      p7  = EXCLUDED.p7,  p8  = EXCLUDED.p8,  p9  = EXCLUDED.p9,
      p10 = EXCLUDED.p10, p11 = EXCLUDED.p11, p12 = EXCLUDED.p12,
      p13 = EXCLUDED.p13, p14 = EXCLUDED.p14, p15 = EXCLUDED.p15,
      p16 = EXCLUDED.p16, p17 = EXCLUDED.p17, p18 = EXCLUDED.p18,
      p19 = EXCLUDED.p19, p20 = EXCLUDED.p20, p21 = EXCLUDED.p21,
      p22 = EXCLUDED.p22, p23 = EXCLUDED.p23, p24 = EXCLUDED.p24,
      estado      = EXCLUDED.estado,
      observacion = EXCLUDED.observacion,
      festivo     = EXCLUDED.festivo
  `;

  try {
    await client.connect();
    console.log(`\n📊 Conectado a la base de datos`);
    await client.query("BEGIN");

    let insertados = 0;
    let actualizados = 0;
    let errores = 0;

    for (const reg of registros) {
      const valores = [
        UCP,
        reg.fecha,
        reg.p1,
        reg.p2,
        reg.p3,
        reg.p4,
        reg.p5,
        reg.p6,
        reg.p7,
        reg.p8,
        reg.p9,
        reg.p10,
        reg.p11,
        reg.p12,
        reg.p13,
        reg.p14,
        reg.p15,
        reg.p16,
        reg.p17,
        reg.p18,
        reg.p19,
        reg.p20,
        reg.p21,
        reg.p22,
        reg.p23,
        reg.p24,
        ESTADO,
        OBSERVACION,
        FESTIVO,
      ];

      try {
        await client.query("SAVEPOINT sp1");
        const result = await client.query(sql, valores);
        await client.query("RELEASE SAVEPOINT sp1");

        // command: INSERT 0 1 => nuevo | INSERT 0 0 => actualizado (DO UPDATE)
        if (result.rowCount === 1 && result.command === "INSERT") {
          insertados++;
        } else {
          actualizados++;
        }
      } catch (err) {
        errores++;
        await client.query("ROLLBACK TO SAVEPOINT sp1");
        console.error(`❌ Error (Fecha: ${reg.fecha}): ${err.message}`);
      }
    }

    await client.query("COMMIT");
    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Insertados:   ${insertados}`);
    console.log(`   - Actualizados: ${actualizados}`);
    console.log(`   - Errores:      ${errores}`);
  } catch (err) {
    console.error("\n❌ Error general:", err);
    await client.query("ROLLBACK");
  } finally {
    await client.end();
    console.log("\n🔌 Conexión cerrada");
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("❌ Uso: node importar-excel.mjs <archivo.xlsx>");
    process.exit(1);
  }

  const ruta = path.resolve(args[0]);
  const registros = await leerExcel(ruta);
  await insertarRegistros(registros);
  console.log("\n🎉 Importación completada exitosamente!");
};

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});

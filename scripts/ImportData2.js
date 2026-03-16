import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
dotenv.config();

/**
 * Configuración de conexión
 */
const createClient = () => {
  return new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT || 5432,
  });
};

const parseFecha = (fechaStr) => {
  if (!fechaStr || fechaStr.trim() === "") return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) return fechaStr.slice(0, 10);

  const match = fechaStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const day = String(match[1]).padStart(2, "0");
    const month = String(match[2]).padStart(2, "0");
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  const d = new Date(fechaStr);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const parseNumero = (valor) => {
  if (!valor || valor === "") return 0;
  const num = parseFloat(String(valor).replace(",", "."));
  return isNaN(num) ? 0 : num;
};

const parseEntero = (valor) => {
  if (!valor || valor === "") return 0;
  const num = parseInt(String(valor).trim(), 10);
  return isNaN(num) ? 0 : num;
};

/**
 * Leer CSV
 */
const leerCSV = (rutaArchivo) => {
  console.log(`\n📄 Leyendo archivo: ${rutaArchivo}`);

  if (!fs.existsSync(rutaArchivo)) {
    throw new Error(`El archivo no existe: ${rutaArchivo}`);
  }

  const contenido = fs.readFileSync(rutaArchivo, "utf-8");

  const registros = parse(contenido, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  console.log(`✅ CSV parseado. Total de registros: ${registros.length}`);
  return registros;
};

/**
 * Transformar cada fila en objeto compatible con la tabla
 * Formato: codigo, ucp, fecha, p1..p24, estado, observacion, festivo
 */
const transformarRegistros = (registros) => {
  console.log(`\n🔄 Transformando registros...`);
  const transformados = [];

  for (const reg of registros) {
    const fecha = parseFecha(reg.fecha);

    if (!fecha) {
      console.warn(`⚠️ Fecha inválida, saltando: ${reg.fecha}`);
      continue;
    }

    if (!reg.ucp || reg.ucp.trim() === "") {
      console.warn(`⚠️ UCP vacío, saltando fecha ${fecha}`);
      continue;
    }

    const registro = {
      codigo: parseEntero(reg.codigo),
      ucp: reg.ucp.trim(),
      fecha: fecha,
      p1: parseNumero(reg.p1),
      p2: parseNumero(reg.p2),
      p3: parseNumero(reg.p3),
      p4: parseNumero(reg.p4),
      p5: parseNumero(reg.p5),
      p6: parseNumero(reg.p6),
      p7: parseNumero(reg.p7),
      p8: parseNumero(reg.p8),
      p9: parseNumero(reg.p9),
      p10: parseNumero(reg.p10),
      p11: parseNumero(reg.p11),
      p12: parseNumero(reg.p12),
      p13: parseNumero(reg.p13),
      p14: parseNumero(reg.p14),
      p15: parseNumero(reg.p15),
      p16: parseNumero(reg.p16),
      p17: parseNumero(reg.p17),
      p18: parseNumero(reg.p18),
      p19: parseNumero(reg.p19),
      p20: parseNumero(reg.p20),
      p21: parseNumero(reg.p21),
      p22: parseNumero(reg.p22),
      p23: parseNumero(reg.p23),
      p24: parseNumero(reg.p24),
      estado: reg.estado ? reg.estado.trim() : "Tipico",
      observacion: reg.observacion ? reg.observacion.trim() : "",
      festivo: parseEntero(reg.festivo),
    };

    transformados.push(registro);
  }

  console.log(`✅ Registros transformados: ${transformados.length}`);
  return transformados;
};

/**
 * Insertar en la base de datos
 */
const insertarRegistros = async (registros) => {
  const client = createClient();

  const insertQuery = `
      INSERT INTO actualizaciondatos (
        codigo, ucp, fecha,
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12,
        p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24,
        estado, observacion, festivo
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27,
        $28, $29, $30
      )
  `;

  try {
    await client.connect();
    console.log(`\n📊 Conectado a la base de datos`);

    await client.query("BEGIN");

    let insertados = 0;
    let errores = 0;

    console.log(`💾 Insertando ${registros.length} registros...`);

    for (const reg of registros) {
      const valores = [
        reg.codigo,
        reg.ucp,
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
        reg.estado,
        reg.observacion,
        reg.festivo,
      ];

      try {
        await client.query("SAVEPOINT sp1");
        await client.query(insertQuery, valores);
        await client.query("RELEASE SAVEPOINT sp1");
        insertados++;
      } catch (err) {
        errores++;
        await client.query("ROLLBACK TO SAVEPOINT sp1");
        console.error(
          `❌ Error insertando registro (UCP: ${reg.ucp}, Fecha: ${reg.fecha}):`,
          err.message,
        );
      }
    }

    await client.query("COMMIT");

    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Registros insertados: ${insertados}`);
    console.log(`   - Errores individuales: ${errores}`);
  } catch (err) {
    console.error("\n❌ Error general:", err);
    await client.query("ROLLBACK");
  } finally {
    await client.end();
    console.log("\n🔌 Conexión cerrada");
  }
};

const main = async () => {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log("❌ Debe indicar el archivo CSV");
      process.exit(1);
    }

    const ruta = path.resolve(args[0]);

    const registros = leerCSV(ruta);
    const transformados = transformarRegistros(registros);

    await insertarRegistros(transformados);

    console.log("\n🎉 Importación completada exitosamente!");
  } catch (err) {
    console.error("❌ Error fatal:", err);
    process.exit(1);
  }
};

main();

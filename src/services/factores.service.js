import FactoresModel from "../models/factores.model.js";
import Logger from "../helpers/logger.js";
import colors from "colors";
import path from "path";
import fs from "fs";
import { createConectionPG } from "../helpers/connections.js";

const model = FactoresModel.getInstance();

export default class FactoresService {
  static instance;

  static getInstance() {
    if (!FactoresService.instance) {
      FactoresService.instance = new FactoresService();
    }
    return FactoresService.instance;
  }
  guardarBarra = async (data, session) => {
    try {
      const client = createConectionPG(session);
      const res = await model.guardarBarra(data, client);
      return {
        success: true,
        data: res,
        message: "Barra creada correctamente",
      };
    } catch (err) {
      Logger.error(err);
      return {
        success: false,
        data: null,
        message: "Error al crear la barra",
      };
    }
  };

  consultarBarrasIndex_xMC = async (mc, session) => {
    try {
      const client = createConectionPG(session);
      const res = await model.consultarBarrasIndex_xMC(mc, client);

      if (!res) {
        return {
          success: false,
          data: null,
          message: "Barras no encontradas.",
        };
      }

      return {
        success: true,
        data: res,
        message: "Barras obtenidas correctamente.",
      };
    } catch (err) {
      Logger.error(
        colors.red("Error FactoresService consultarBarrasIndex_xMC"),
        err,
      );
      return {
        success: false,
        data: null,
        message: "Error al obtener las barras.",
      };
    }
  };

  actualizarBarra = async (id, data, session) => {
    try {
      const client = createConectionPG(session);
      await model.actualizarBarra(id, data, client);
      return {
        success: true,
        message: "Barra actualizada correctamente",
      };
    } catch (err) {
      Logger.error(err);
      return {
        success: false,
        message: "Error al actualizar la barra",
      };
    }
  };

  guardarAgrupacion = async (data, session) => {
    try {
      const client = createConectionPG(session);
      const res = await model.guardarAgrupacion(data, client);
      return {
        success: true,
        data: res,
        message: "Agrupación creada correctamente",
      };
    } catch (err) {
      Logger.error(err);
      return {
        success: false,
        data: null,
        message: "Error al crear la agrupación",
      };
    }
  };

  consultarAgrupacionesIndex_xBarraId = async (barra_id, session) => {
    try {
      const client = createConectionPG(session);
      const res = await model.consultarAgrupacionesIndex_xBarraId(
        barra_id,
        client,
      );

      if (!res) {
        return {
          success: false,
          data: null,
          message: "Agrupaciones no encontradas.",
        };
      }

      return {
        success: true,
        data: res,
        message: "Agrupaciones obtenidas correctamente.",
      };
    } catch (err) {
      Logger.error(
        colors.red("Error FactoresService consultarAgrupacionesIndex_xBarraId"),
        err,
      );
      return {
        success: false,
        data: null,
        message: "Error al obtener las agrupaciones.",
      };
    }
  };

  actualizarAgrupacion = async (id, data, session) => {
    try {
      const client = createConectionPG(session);
      await model.actualizarAgrupacion(id, data, client);
      return {
        success: true,
        message: "Agrupación actualizada correctamente",
      };
    } catch (err) {
      Logger.error(err);
      return {
        success: false,
        message: "Error al actualizar la agrupación",
      };
    }
  };

  eliminarBarraConAgrupaciones = async (id, session) => {
    try {
      const client = createConectionPG(session);
      await model.eliminarBarraConAgrupaciones(id, client);
      return {
        success: true,
        message: "Barra y agrupaciones eliminadas correctamente",
      };
    } catch (err) {
      Logger.error(err);
      return {
        success: false,
        message: "Error al eliminar la barra",
      };
    }
  };

  eliminarAgrupacion = async (id, session) => {
    try {
      const client = createConectionPG(session);
      await model.eliminarAgrupacion(id, client);
      return {
        success: true,
        message: "Agrupación eliminada correctamente",
      };
    } catch (err) {
      Logger.error(err);
      return {
        success: false,
        message: "Error al eliminar la agrupación",
      };
    }
  };

  eliminarRapido = async (data, session) => {
    try {
      const client = createConectionPG(session);
      await model.eliminarMedidasRapido(data, client);
      return { success: true, message: "Medidas eliminadas correctamente" };
    } catch {
      return { success: false, message: "Error al eliminar medidas" };
    }
  };

  actualizarRapido = async (data, session) => {
    try {
      const client = createConectionPG(session);
      await model.actualizarMedidasRapido(data, client);
      return { success: true, message: "Medidas actualizadas correctamente" };
    } catch {
      return { success: false, message: "Error al actualizar medidas" };
    }
  };

  insertarRapido = async (data, session) => {
    try {
      const client = createConectionPG(session);
      await model.insertarMedidasRapido(data, client);
      return { success: true, message: "Medidas insertadas correctamente" };
    } catch {
      return { success: false, message: "Error al insertar medidas" };
    }
  };

  descargarPlantillaMedidas = async () => {
    const filePath = path.join(
      process.cwd(),
      "Plantillas",
      "CargarMedidasPrimeGridt.xlsx",
    );

    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        filePath: null,
        message: "La plantilla no existe en el servidor",
      };
    }

    return {
      success: true,
      filePath,
      filename: "CargarMedidasPrimeGridt.xlsx",
      message: "Plantilla obtenida correctamente",
    };
  };

  eliminarFechasIngresadasTodos = async (ucp, session) => {
    try {
      const client = createConectionPG(session);
      await model.eliminarFechasIngresadasTodos(ucp, client);
      return { success: true, message: "Fechas eliminadas correctamente" };
    } catch {
      return { success: false, message: "Error al eliminar fechas" };
    }
  };

  guardarRangoFecha = async (data, session) => {
    try {
      const client = createConectionPG(session);
      await model.guardarRangoFecha(data, client);
      return { success: true, message: "Rango de fecha guardado" };
    } catch {
      return { success: false, message: "Error al guardar rango" };
    }
  };

  reiniciarMedidas = async (session) => {
    try {
      const client = createConectionPG(session);
      await model.reiniciarMedidas(client);
      return { success: true, message: "Medidas reiniciadas" };
    } catch {
      return { success: false, message: "Error al reiniciar medidas" };
    }
  };

  consultarBarraNombre = async (barra, session) => {
    try {
      const client = createConectionPG(session);
      const data = await model.consultarBarraNombre(barra, client);
      return { success: true, data };
    } catch {
      return { success: false, message: "Error al consultar barras" };
    }
  };

  consultarBarraFlujoNombreInicial = async (barra, tipo, session) => {
    try {
      const client = createConectionPG(session);
      const data = await model.consultarBarraFlujoNombreInicial(
        barra,
        tipo,
        client,
      );
      return { success: true, data };
    } catch {
      return { success: false, message: "Error al consultar flujos" };
    }
  };

  consultarBarraFactorNombre = async (barra, tipo, codigosRPM, session) => {
    try {
      const client = createConectionPG(session);
      const data = await model.consultarBarraFactorNombre(
        barra,
        tipo,
        codigosRPM,
        client,
      );

      return {
        success: true,
        data,
        message: "Factores obtenidos correctamente",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: "Error al consultar factores",
      };
    }
  };

  consultarMedidasCalcularCompleto = async (params, session) => {
    try {
      const client = createConectionPG(session);
      const data = await model.consultarMedidasCalcularCompleto(params, client);

      return {
        success: true,
        data,
        message: "Medidas calculadas correctamente",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: "Error al calcular medidas",
      };
    }
  };

  async calculosCurvasTipicas(
    inicioIso,
    finIso,
    ucp,
    tipo_dia,
    flujo_tipo,
    n_max,
    barra,
    timeoutMs = 600000,
    session,
  ) {
    // Helper: genera db_url desde session
    const generateDbUrl = (session) => {
      try {
        const { host, usuario, contrasenia, puerto, basededatos } = session;

        if (!host || !usuario || !puerto || !basededatos) {
          throw new Error("Missing required database connection parameters");
        }

        if (contrasenia) {
          return `postgresql://${usuario}:${contrasenia}@${host}:${puerto}/${basededatos}`;
        } else {
          return `postgresql://${usuario}@${host}:${puerto}/${basededatos}`;
        }
      } catch (error) {
        Logger.error("Error generating database URL:", error);
        throw error;
      }
    };

    const database_url = generateDbUrl(session);

    const hostsToTry = ["127.0.0.1", "localhost"];
    //puerto produccion
    // const port = 8003;
    //puerto desarrollo
    const port = 8003;

    for (const host of hostsToTry) {
      let timer;
      try {
        const url = `http://${host}:${port}/factores/calculos/curvas-tipicas`;
        const controller = new AbortController();
        const signal = controller.signal;

        timer = setTimeout(() => {
          controller.abort();
        }, timeoutMs);

        const res = await fetch(url, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fecha_inicial: inicioIso,
            fecha_final: finIso,
            mc: ucp,
            tipo_dia,
            flujo_tipo,
            n_max,
            barra,
            database_url,
          }),
          signal,
        });

        clearTimeout(timer);

        const statusCode = res.status;
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          Logger.warn(
            colors.yellow(
              `errorFeedback: HTTP ${statusCode} desde ${host}:${port}`,
            ),
          );
          return { success: false, statusCode, data: json };
        }

        return {
          success: true,
          statusCode,
          data: json,
        };
      } catch (err) {
        clearTimeout(timer);
        if (err?.name === "AbortError") {
          Logger.warn(
            colors.yellow(
              `errorFeedback: timeout (${timeoutMs}ms) hacia ${host}:${port}`,
            ),
          );
        } else {
          Logger.warn(
            colors.yellow(
              `errorFeedback: error conectando a ${host}:${port} — ${
                err?.message || err
              }`,
            ),
          );
        }
      }
    }

    Logger.error(colors.red(`errorFeedback: Falló en todos los hosts`));

    return { success: false, statusCode: 0, data: null };
  }

  async calculoFda(
    inicioIso,
    finIso,
    ucp,
    tipo_dia,
    curvas_tipicas,
    timeoutMs = 600000,
  ) {
    const hostsToTry = ["127.0.0.1", "localhost"];
    //puerto produccion
    // const port = 8003;
    //puerto desarrollo
    const port = 8003;

    for (const host of hostsToTry) {
      let timer;
      try {
        const url = `http://${host}:${port}/factores/calculos/fda`;
        const controller = new AbortController();
        const signal = controller.signal;

        timer = setTimeout(() => {
          controller.abort();
        }, timeoutMs);

        const res = await fetch(url, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fecha_inicial: inicioIso,
            fecha_final: finIso,
            mc: ucp,
            tipo_dia,
            curvas_tipicas,
          }),
          signal,
        });

        clearTimeout(timer);

        const statusCode = res.status;
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          Logger.warn(
            colors.yellow(
              `errorFeedback: HTTP ${statusCode} desde ${host}:${port}`,
            ),
          );
          return { success: false, statusCode, data: json };
        }

        return {
          success: true,
          statusCode,
          data: json,
        };
      } catch (err) {
        clearTimeout(timer);
        if (err?.name === "AbortError") {
          Logger.warn(
            colors.yellow(
              `errorFeedback: timeout (${timeoutMs}ms) hacia ${host}:${port}`,
            ),
          );
        } else {
          Logger.warn(
            colors.yellow(
              `errorFeedback: error conectando a ${host}:${port} — ${
                err?.message || err
              }`,
            ),
          );
        }
      }
    }

    Logger.error(colors.red(`errorFeedback: Falló en todos los hosts`));

    return { success: false, statusCode: 0, data: null };
  }

  async calculoFdp(
    inicioIso,
    finIso,
    ucp,
    tipo_dia,
    curvas_tipicas,
    timeoutMs = 600000,
  ) {
    const hostsToTry = ["127.0.0.1", "localhost"];
    //puerto produccion
    // const port = 8003;
    //puerto desarrollo
    const port = 8003;

    for (const host of hostsToTry) {
      let timer;
      try {
        const url = `http://${host}:${port}/factores/calculos/fdp`;
        const controller = new AbortController();
        const signal = controller.signal;

        timer = setTimeout(() => {
          controller.abort();
        }, timeoutMs);

        const res = await fetch(url, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fecha_inicial: inicioIso,
            fecha_final: finIso,
            mc: ucp,
            tipo_dia,
            curvas_tipicas,
          }),
          signal,
        });

        clearTimeout(timer);

        const statusCode = res.status;
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          Logger.warn(
            colors.yellow(
              `errorFeedback: HTTP ${statusCode} desde ${host}:${port}`,
            ),
          );
          return { success: false, statusCode, data: json };
        }

        return {
          success: true,
          statusCode,
          data: json,
        };
      } catch (err) {
        clearTimeout(timer);
        if (err?.name === "AbortError") {
          Logger.warn(
            colors.yellow(
              `errorFeedback: timeout (${timeoutMs}ms) hacia ${host}:${port}`,
            ),
          );
        } else {
          Logger.warn(
            colors.yellow(
              `errorFeedback: error conectando a ${host}:${port} — ${
                err?.message || err
              }`,
            ),
          );
        }
      }
    }

    Logger.error(colors.red(`errorFeedback: Falló en todos los hosts`));

    return { success: false, statusCode: 0, data: null };
  }

  async calcularMedidas(inicioIso, finIso, e_ar, ucp, timeoutMs = 600000) {
    const hostsToTry = ["127.0.0.1", "localhost"];
    //puerto produccion
    const port = 8003;
    //puerto desarrollo
    // const port = 8003;

    for (const host of hostsToTry) {
      let timer;

      try {
        const params = new URLSearchParams({
          fecha_inicial: inicioIso,
          fecha_final: finIso,
          e_ar,
          mc: ucp,
        });

        const url = `http://${host}:${port}/factores/medidas/calcular?${params.toString()}`;

        const controller = new AbortController();
        const signal = controller.signal;

        timer = setTimeout(() => {
          controller.abort();
        }, timeoutMs);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
          signal,
        });

        clearTimeout(timer);

        const statusCode = res.status;
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          Logger.warn(
            colors.yellow(`calcular: HTTP ${statusCode} desde ${host}:${port}`),
          );
          return { success: false, statusCode, data: json };
        }

        return {
          success: true,
          statusCode,
          data: json,
        };
      } catch (err) {
        clearTimeout(timer);

        if (err?.name === "AbortError") {
          Logger.warn(
            colors.yellow(
              `calcular: timeout (${timeoutMs}ms) hacia ${host}:${port}`,
            ),
          );
        } else {
          Logger.warn(
            colors.yellow(
              `calcular: error conectando a ${host}:${port} — ${
                err?.message || err
              }`,
            ),
          );
        }
      }
    }

    Logger.error(colors.red(`calcular: Falló en todos los hosts`));

    return { success: false, statusCode: 0, data: null };
  }

  buscarUltimaFechaMedida = async (session) => {
    try {
      const client = createConectionPG(session);
      const row = await model.buscarUltimaFechaMedida(client);
      return { success: true, data: row, message: "Búsqueda completada." };
    } catch (error) {
      Logger.error(
        colors.red("Error FactoresService buscarUltimaFechaMedida"),
        error,
      );
      return {
        success: false,
        data: null,
        message: `Error al buscar la ultima fecha medidas.`,
      };
    }
  };

  obtenerDatosCompletoBarra = async (params, session) => {
    const {
      barras, // array de strings con nombres de barras
      fecha_inicial,
      fecha_final,
      mc,
      tipo_dia,
      flujo_tipo,
      n_max,
    } = params;

    try {
      const client = createConectionPG(session);

      // ── 1. Todos los datos estáticos de todas las barras en paralelo ──
      const infoBarras = await Promise.all(
        barras.map(async (barra) => {
          const [codigosRpmRows, flujosRows] = await Promise.all([
            model.consultarBarraNombre(barra, client),
            model.consultarBarraFlujoNombreInicial(barra, flujo_tipo, client),
          ]);

          const codigosRpm = codigosRpmRows?.map((r) => r.codigo_rpm) ?? [];
          const flujos = flujosRows?.map((r) => r.flujo) ?? [];

          const factoresRows =
            codigosRpm.length > 0
              ? await model.consultarBarraFactorNombre(
                  barra,
                  flujo_tipo,
                  codigosRpm, // <-- directo, sin envolver en objeto
                  client,
                )
              : [];

          return { barra, codigosRpm, flujos, factoresRows };
        }),
      );

      // ── Helper: ejecutar en lotes para no agotar el pool de conexiones ──
      const procesarEnLotes = async (items, tamanoLote, fn) => {
        const resultados = [];
        for (let i = 0; i < items.length; i += tamanoLote) {
          const lote = items.slice(i, i + tamanoLote);
          const resultadosLote = await Promise.all(lote.map(fn));
          resultados.push(...resultadosLote);
        }
        return resultados;
      };

      const medidasPorBarra = await procesarEnLotes(
        infoBarras,
        3,
        async ({ barra, codigosRpm, flujos }) => {
          if (!codigosRpm.length || !flujos.length) return null;

          // ⚠️ Crear client NUEVO por cada llamada porque el model hace connect/end
          const clientMedida = createConectionPG(session);
          try {
            const rows = await model.consultarMedidasCalcularCompleto(
              {
                fecha_inicial,
                fecha_final,
                mc,
                flujo: flujos,
                tipo_dia,
                codigo_rpm: codigosRpm,
                barra,
              },
              clientMedida,
            );
            // El model devuelve rows directamente (no { data: rows })
            return { data: rows ?? [] };
          } catch (err) {
            Logger.error(`Error medidas barra ${barra}:`, err);
            return { data: [] };
          }
        },
      );

      // ── 3. Curvas en lotes de 3 ──
      const curvasPorBarra = await procesarEnLotes(barras, 3, async (barra) => {
        const res = await this.calculosCurvasTipicas(
          fecha_inicial,
          fecha_final,
          mc,
          tipo_dia,
          flujo_tipo,
          n_max,
          barra,
          600000,
          session,
        );
        return res;
      });

      // ── 3. Armar respuesta ──
      const resultado = infoBarras.map((info, idx) => ({
        barra: info.barra,
        factoresRows: info.factoresRows ?? [],
        medidas: medidasPorBarra[idx]?.data ?? [],
        curvas: curvasPorBarra[idx]?.data?.data ?? [], // ← era .data.data.data, es .data.data
      }));

      return {
        success: true,
        data: resultado,
        message: "Datos completos obtenidos correctamente",
      };
    } catch (err) {
      Logger.error(colors.red("Error obtenerDatosCompletoBarra"), err);
      return {
        success: false,
        data: null,
        message: "Error al obtener datos completos",
      };
    }
  };
}

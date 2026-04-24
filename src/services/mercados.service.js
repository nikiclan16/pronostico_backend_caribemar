import Logger from "../helpers/logger.js";
import colors from "colors";
import * as utils from "../helpers/utils.js";
import moment from "moment";

export default class MercadosService {
  static instance;
  static getInstance() {
    if (MercadosService.instance === undefined) {
      MercadosService.instance = new MercadosService();
    }
    return MercadosService.instance;
  }
}

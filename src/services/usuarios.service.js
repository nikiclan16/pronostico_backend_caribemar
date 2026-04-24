import Logger from "../helpers/logger.js";
import colors from "colors";

import moment from "moment";

export default class UsuariosService {
  static instance;
  static getInstance() {
    if (UsuariosService.instance === undefined) {
      UsuariosService.instance = new UsuariosService();
    }
    return UsuariosService.instance;
  }
}

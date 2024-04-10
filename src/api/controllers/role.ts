import BaseCtrl from './base';
import Role from '../../model/role';

export default class RoleController extends BaseCtrl {

  constructor() {
    super();
    this.model = Role;
  }
 
}
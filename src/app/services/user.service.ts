import {Injectable, Inject} from '@angular/core';
import { Subject }    from 'rxjs/Subject';

import {SwellRTService} from "./swellrt.service";

@Injectable()
export class UserService {

  user: any;
  currentUser = new Subject<any>();
  userLogged = new Subject<any>();
  userRegistered = new Subject<any>();
  userUpdated = new Subject<any>();

  constructor(@Inject('DEFAULT_AVATAR_URL') private defaultAvatarUrl: string,
              private swellrt: SwellRTService) {
    this.currentUser.subscribe(user => {
      this.user = user;
    });
  }

  getUser() {
    return this.user;
  }

  loggedUser() {
    return this.user && !this.user.anonymous;
  }

  resume() {
    this.swellrt.resume().then(user => {
      this.sendCurrentUserEvent(user);
    });
  }

  login(user: string, password: string) {
    this.swellrt.login(user + this.swellrt.domain, password).then(user => {
        this.sendCurrentUserEvent(user);
        this.sendUserLoggedEvent(user);
    });
  }

  create(user: string, password: string) {
    this.swellrt.createUser(user, password).then(() => {
      return this.swellrt.login(user, password);
    }).then(user => {
      this.sendCurrentUserEvent(user);
      this.sendUserRegisteredEvent(user);
    });
  }

  update(email: string, avatar: string) {
    this.swellrt.updateUser(email, avatar).then(user => {
      this.sendUserUpdatedEvent(user);
    });
  }

  logout() {
    this.swellrt.logout().then(user => {
      this.sendCurrentUserEvent(user);
    });
  }

  changePassword(oldPassword: string, newPassword: string) {
    this.swellrt.changePassword(this.user.name + this.swellrt.domain, oldPassword, newPassword).then(user => {
      this.sendUserUpdatedEvent(user);
    });
  }

  recoverPassword(email: string) {
    this.swellrt.recoverPassword(email).then(user => {
      this.sendUserUpdatedEvent(user);
    });
  }

  parseUserResponse(user) {
    let name = user.name;
    if ( /_anonymous_/.test(user.id)) {
      name = 'Anonymous';
    }
    return  {
      id: user.id,
      name: name ? name : user.id.slice(0, user.id.indexOf('@')),
      anonymous: name === "Anonymous",
      avatarUrl: user.avatarUrl ? user.avatarUrl : this.defaultAvatarUrl
    }
  }

  sendCurrentUserEvent(user) {
    this.currentUser.next(this.parseUserResponse(user));
  }

  sendUserLoggedEvent(user) {
    this.userLogged.next(this.parseUserResponse(user));
  }

  sendUserRegisteredEvent(user) {
    this.userRegistered.next(this.parseUserResponse(user));
  }

  sendUserUpdatedEvent(user) {
    this.userUpdated.next(this.parseUserResponse(user));
  }

}

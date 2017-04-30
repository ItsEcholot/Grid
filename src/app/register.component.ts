import {Component, OnInit} from '@angular/core';
import {SocketIO} from '../services/socket-io';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.scss']
})
export class RegisterComponent implements OnInit  {
  private socketIO: SocketIO;
  private user = {
    username: null,
    password: null,
    repeatedPassword: null,
    samePassword: true,
    usernameAvailable: null,
  };
  constructor(socketio: SocketIO) {
    this.socketIO = socketio;
  }
  ngOnInit()  {
    this.socketIO.getSocket().on('checkUsernameAvailabilityReply', (data) =>  {
      this.user.usernameAvailable = data.result;
      if (this.user.username.length < 3) {
        this.user.usernameAvailable = false;
      }
    });
  }
  private onSubmitRegister()  {
    const salt = (Math.random().toString(36) + '00000000000000000').slice(2, 10 + 2);
    this.socketIO.getSocket().on('registerReply', (data) => {
      console.log(data.success);
      this.socketIO.getSocket().off('registerReply');
    });
    this.socketIO.sendMessage('register', {
      username: this.user.username,
      passwordSalt: salt,
      passwordHash: CryptoJS.SHA512(salt + this.user.password).toString(CryptoJS.enc.Hex)
    });
  }
  private onUsernameChange(value) {
    this.socketIO.sendMessage('checkUsernameAvailability', {
      username: value
    });
  }
  private onPasswordChange(value) {
    this.user.samePassword = this.user.password === this.user.repeatedPassword;
  }
}

import { Component, OnInit } from '@angular/core';
import { SocketIO } from 'services/socket-io';
import * as $ from 'jquery';
import 'jquery.terminal';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private title = 'Grid';
  private version = '1.0.2 Farnsworth';
  private jqueryTerminal;
  private window;
  private socketio: SocketIO;

  constructor(socketio: SocketIO) {
    this.socketio = socketio;
  }

  ngOnInit() {
    this.jqueryTerminal = jQuery('#terminal').terminal((command) => {
      if (command === 'ping') {
        let startTime = Date.now();

        this.socketio.getSocket().on('latencyPong', (data) => {
          const latency = Date.now() - startTime;
          this.jqueryTerminal.echo(`
            <b>Pong</b>
            <br>
            ${latency}ms
          `, {
            raw: true
          });
          this.socketio.getSocket().off('latencyPong');
          this.jqueryTerminal.resume();
        });

        this.jqueryTerminal.pause();
        startTime = Date.now();
        this.socketio.sendMessage('latencyPing', '');
      } else if (command !== '') {
        this.jqueryTerminal.pause();
        this.socketio.sendMessage('command', command);
      }
    }, {
      greetings: `Grid OS - ${this.version}`,
      name: 'js_demo',
      prompt: '> ',
      scrollOnEcho: true,
      login: (user, password, callback) => {
        this.socketio.getSocket().on('loginChallenge', (data) =>  {
          this.socketio.getSocket().off('loginChallenge');
          const challenge = data.challenge;
          const salt = data.salt;
          this.socketio.sendMessage('login',  {
            username: user,
            challenge: challenge,
            hash: CryptoJS.SHA512(user + challenge + CryptoJS.SHA512(salt + password).toString(CryptoJS.enc.Hex)).toString(CryptoJS.enc.Hex)
          });
        });
        this.socketio.getSocket().on('authorization', (data) => {
          if (data.success && data.token)  {
            callback(data.token);
            this.socketio.sendMessage('command', 'motd');
          } else  {
            callback(null);
          }
          this.socketio.getSocket().off('authorization');
        });
        this.socketio.sendMessage('requestLoginChallenge', {
          username: user
        });
      }
    });

    this.jqueryTerminal.echo('<br>Connecting to backbone...', {raw: true});

    this.socketio.getSocket().on('response', (data) => {
      this.receivedResponse(data);
    });
  }

  receivedResponse(data) {
    this.jqueryTerminal.echo(data, {
      raw: true
    });
    this.jqueryTerminal.resume();
  }
}

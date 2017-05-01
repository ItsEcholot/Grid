import {Component, OnInit} from '@angular/core';
import {SocketIO} from 'services/socket-io';
import * as $ from 'jquery';
import 'jquery.terminal';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-game',
  templateUrl: 'game.component.html',
  styleUrls: ['game.component.scss']
})
export class GameComponent implements OnInit  {
  private version = '1.1.1 Farnsworth';
  private jqueryTerminal;
  private socketio: SocketIO;
  constructor(socketio: SocketIO) {
    this.socketio = socketio;
  }
  ngOnInit()  {
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
        this.socketio.sendMessage('command', {
          command: command,
          username: this.jqueryTerminal.login_name(),
          token: this.jqueryTerminal.token()
        });
      }
    }, {
      greetings: ``,
      name: 'js_demo',
      prompt: '> ',
      scrollOnEcho: true,
      login: this.login,
      onBeforeLogin: (terminal) => {
        terminal.echo(`<span style="color: #00ff00">Grid OS - ${this.version}</span>`, {raw: true});
        terminal.echo('<br>Connecting to backbone...', {raw: true});
        terminal.echo(`To register please visit <a href="/register">grid.frostbolt.ch/register</a>`, {raw: true});
      }
    });

    // Logout if already logged in
    if (this.jqueryTerminal.token()) {
      this.jqueryTerminal.logout();
    }

    this.socketio.getSocket().on('response', (data) => {
      this.receivedResponse(data);
    });
  }

  private receivedResponse(data) {
    this.jqueryTerminal.echo(data, {
      raw: true
    });
    this.jqueryTerminal.resume();
    window.scrollTo(0, document.body.scrollHeight);
  }
  private login = (user, password, callback) => {
    user = user.toLowerCase();
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
        this.jqueryTerminal.clear();
        this.socketio.sendMessage('command', {
          command: 'motd',
          username: this.jqueryTerminal.login_name(),
          token: this.jqueryTerminal.token()
        });
        this.jqueryTerminal.set_prompt(`${this.jqueryTerminal.login_name()} > `);
      } else  {
        callback(null);
      }
      this.socketio.getSocket().off('authorization');
    });
    this.socketio.sendMessage('requestLoginChallenge', {
      username: user
    });
  }
}

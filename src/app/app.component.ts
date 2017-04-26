import { Component, OnInit } from '@angular/core';
import { SocketIO } from 'services/socket-io';
import * as $ from 'jquery';
import 'jquery.terminal';

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
  private socketio:SocketIO;

  constructor(socketio:SocketIO) {
    this.socketio = socketio;
  }

  ngOnInit() {
    this.jqueryTerminal = jQuery('#terminal').terminal((command) => {
      if (command === 'ping') {
        let startTime = Date.now();

        this.socketio.getSocket().on('latencyPong', (data) => {
          let latency = Date.now() - startTime;
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
      }
      else if (command !== '') {
        this.jqueryTerminal.pause();
        this.socketio.sendMessage('command', command);
      }
    }, {
      greetings: `Grid OS - ${this.version}`,
      name: 'js_demo',
      prompt: '> ',
      scrollOnEcho: true,
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

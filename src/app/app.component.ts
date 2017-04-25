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
  private jqueryTerminal;
  private window;
  private socketio: SocketIO;

  constructor(socketio: SocketIO)  {
    this.socketio = socketio;
  }

  ngOnInit()  {
    this.jqueryTerminal = jQuery('#terminal').terminal((command) => {
      if (command !== '') {
        this.jqueryTerminal.pause();
        this.socketio.sendMessage('command', command);
      }
    }, {
      greetings: 'Grid OS - 1.0.1 Farnsworth',
      name: 'js_demo',
      prompt: '> ',
      scrollOnEcho: true,
    });
    this.socketio.getSocket().on('response', (data) =>  {
      this.receivedResponse(data);
    });
  }
  receivedResponse(data)  {
    this.jqueryTerminal.echo(data, {
      raw: true
    });
    this.jqueryTerminal.resume();
  }
}

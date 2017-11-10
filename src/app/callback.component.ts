import { Component } 	 from '@angular/core';

import { AuthService } from './auth.service';

@Component({
  selector: 'callback',
  template: 	`
  <div class="ui active dimmer">
    <div class="ui large text loader">
		Please wait while setting your session...
  </div>
  </div>
<!--
		<h4 class="ui center aligned header" style="position:relative;top:200px;">
		Please wait while setting your session...
		</h4>
-->
		`,
  styleUrls: ["../../node_modules/font-awesome/css/font-awesome.min.css",
    "../../node_modules/primeng/resources/primeng.min.css",
    "../../node_modules/primeng/resources/themes/omega/theme.css",
    './app.component.css',
    '../assets/Semantic-UI-CSS-master/semantic.min.css'],
})

export class CallbackComponent {

  constructor(private authService : AuthService) { 
	console.log("I got alive");
  }

}




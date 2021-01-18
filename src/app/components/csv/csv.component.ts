import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentification/auth.service';
import { TokenStorage } from 'src/app/services/authentification/token-storage.service';
import * as $ from 'jquery';
 
@Component({
  selector: 'app-csv',
  templateUrl: './csv.component.html',
  styleUrls: ['./csv.component.scss']
})
export class CsvComponent implements OnInit {
  username: string;
  constructor(public auth: AuthenticationService, private tokenStorage: TokenStorage) {
    this.initUser();
  }

  ngOnInit() {
this.animatePage();
  }

  initUser() {
    const currentUser = this.tokenStorage.getUsername();
    this.username = currentUser;
  }

animatePage(){

  $(".sidebar-dropdown > a").click(function() {
    $(".sidebar-submenu").slideUp(200);
    if (
    $(this)
      .parent()
      .hasClass("active")
    ) {
    $(".sidebar-dropdown").removeClass("active");
    $(this)
      .parent()
      .removeClass("active");
    } else {
    $(".sidebar-dropdown").removeClass("active");
    $(this)
      .next(".sidebar-submenu")
      .slideDown(200);
    $(this)
      .parent()
      .addClass("active");
    }
    });
    
    $("#close-sidebar").click(function() {
    $(".page-wrapper").removeClass("toggled");
    });
    $("#show-sidebar").click(function() {
    $(".page-wrapper").addClass("toggled");
    });
    
}
}

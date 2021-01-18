import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentification/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(private auth: AuthenticationService, private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      'username': new FormControl('', Validators.required),
      'password': new FormControl('', Validators.required)
    });

  }

  validate(loginFormValue: any) {

    this.auth.requestToken(loginFormValue.username, loginFormValue.password).subscribe(
      status => {
        if (status) {
          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error('Not found!');
        }
      },
      error => {
        this.toastr.error('User not found!', error.status);
      }
    );


  }

}

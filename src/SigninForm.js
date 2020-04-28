import React, { Component } from 'react';
import {withRouter} from 'react-router';
import "./styles.css";
class SigninForm extends Component{
    render(){
        const {
            state: {
                email, password
            }, 
            onEmailUpdate,
            onPasswordUpdate,
            onSubmit,
            history,
        } = this.props;

        const FORM_NAME = 'signInForm';

        return(
            <div class="central">
                <div class="login-form">
                <h2>Sign In</h2>
                <div>
                    <input 
                        type="email" 
                        onChange={e => onEmailUpdate(FORM_NAME, e.target.value)}
                        value = {email}
                        placeholder="Email" />
                </div>
                <div>
                    <input 
                        type="password" 
                        onChange={e => onPasswordUpdate(FORM_NAME, e.target.value)}
                        value = {password}
                        placeholder="Password"/>
                </div>
                <div>
                    <button type="button" onClick={ () => {
                         onSubmit(); 
                         history.push('/app/user/me/profile');
                         }
                    }>Continue</button>
                </div>
            </div>
            </div>
        );
    }
}
const SignInFormWithRouter = withRouter(SigninForm);
export default withRouter(SigninForm);
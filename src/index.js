import React, { Component } from 'react';
import { render } from 'react-dom';
import {
    BrowserRouter as Router,
    Route,
    Link,
  } from "react-router-dom";
import {withRouter} from 'react-router';
class SigninForm extends Component{
    render(){
        const {
            state: {
                email, password
            }, 
            onEmailUpdate,
            onPasswordUpdate,
            onSubmit,
        } = this.props;

        const FORM_NAME = 'signInForm';

        return(
            <div>
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
                        onSubmit(); }
                    }>Continue</button>
                </div>
            </div>
        );
    }
}

class UserProfile extends Component{
    render(){
        const {user} = this.props;
        return(
            <div>
                <h2>User Profile</h2>
                <span>Hi {user.displayName}</span>
            </div>
            
        );
    }
}
class SignupForm extends Component{
    render(){
        const {
            state: {
                displayName, email, password
            }, 
            onNameUpdate,
            onEmailUpdate,
            onPasswordUpdate,
            onSubmit,
            history,
        } = this.props;

        const FORM_NAME = 'signUpForm';
        
        return(
            <div>
                <h2>Sign Up for Pairs!</h2>
                <div>
                    <input 
                        type="text" 
                        onChange={e => onNameUpdate(e.target.value)}
                        value = {name}
                        placeholder="Name" />
                </div>
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
                        history.push('/app/user/profile')}
                    }>Continue</button>
                </div>

            </div>
          );
    }
}

//will route sign up form, extract history/properties and create a new react component
const SignUpFormWithRouter = withRouter(SignupForm); 
const SignInFormWithRouter = withRouter(SigninForm);

class App extends Component{
    constructor(props){
        super(props);
        this.state={
            currentuser: null, 
            signInForm:{
                email:'alice@example.com',
                password:'123123'
            },
            signUpForm:{
                displayName:'',
                email:'',
                password:''
            },
        };
    }
    onNameUpdate(name){
        const {signUpForm} = this.state;
        const updatedForm = Object.assign({}, signUpForm, { name })
        this.setState({
            signUpForm: updatedForm,
        })
    }
    onEmailUpdate(form, email){
        const oldForm = this.state[form];
        const updatedForm = Object.assign({}, oldForm, { email })
        this.setState({
            [form]: updatedForm,
        })
    }
    onPasswordUpdate(form, password){
        const oldForm = this.state[form]
        const updatedForm = Object.assign({}, oldForm, { password })
        this.setState({
            [form]: updatedForm,
        })
    }
    onSignUpSubmit(){
        const {signUpForm} = this.state;
        this.setState({
            currentuser: {
                displayName: signUpForm.name,
                email: signUpForm.email,
            },
            signUpForm:{
                displayName:'',
                email:'',
                password:''
            },
        });
    }
    onSignInSubmit(){
        const {
            signInForm: {
                email,
                password,
            },
        } = this.state;
        
        //api call to use email and password
        fetch (
            'http://localhost:8080/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                }), 
            }
        ).then(data => data.json())
        .then(({ access_token }) => {
            console.log(access_token);
            fetch (
                'http://localhost:8080/api/users/me',
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`, 
                    }
                }
                ).then(data => data.json())
                .then(({email, displayName}) => {
                    this.setState({
                        currentuser: {
                            email,
                            displayName
                        }
                    });
                });
        })
        .catch(err => console.error(err));
    }
    
    render(){
        const {currentuser, signUpForm, signInForm} = this.state; 
        
        return (
            <Router>
                <div>
                    <ul>
                        <li><Link to= "/app/signin">Sign in</Link></li>
                        <li><Link to= "/app/signup">Sign up</Link></li>
                        { currentuser && 
                            <li><Link to= "/app/user/profile">{currentuser.displayName}</Link></li>
                        }
                    </ul>
                    <div> 
                        <Route path="/app/signup" render= { () => (
                            <SignUpFormWithRouter    
                                state={signUpForm}
                                onNameUpdate={this.onNameUpdate.bind(this)}
                                onEmailUpdate={this.onEmailUpdate.bind(this)}
                                onPasswordUpdate={this.onPasswordUpdate.bind(this)}
                                onSubmit={this.onSignUpSubmit.bind(this)}
                            /> 
                        )}/>
                        <Route path="/app/signin" render= { () => (
                            <SignInFormWithRouter    
                                state={signInForm}
                                onEmailUpdate={this.onEmailUpdate.bind(this)}
                                onPasswordUpdate={this.onPasswordUpdate.bind(this)}
                                onSubmit={this.onSignInSubmit.bind(this)}
                            /> 
                        )}/>
                        <Route path="/app/user/profile" render= { () => (<UserProfile user={currentuser}/>)}/>
                    </div>
                </div>
            </Router>
        );
    }
}
const container = document.getElementById('root');

render(
    <App />,
    container
);
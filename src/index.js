import React, { Component } from 'react';
import { render } from 'react-dom';
import API from './api.js';

import SignupForm from './SignupForm.js'; 
import SigninForm from './SigninForm.js'; 
import UserProfile from './UserProfile.js'; 

import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link,
  } from "react-router-dom";
import {withRouter} from 'react-router';
import { get } from 'mongoose';

class App extends Component{
    constructor(props){
        super(props);
        const access_token = window.localStorage.getItem('access_token');
        this.state={
            access_token,
            currentuser: null, 
            user: null,
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
        this.api = API(access_token);
    }
    componentDidUpdate(){
        const {access_token} = this.state;
        window.localStorage.setItem('access_token', access_token); 
    }

    componentDidMount(){
        const {access_token} = this.state; 
        this.loadCurrentUser();
    }

    onNameUpdate(displayName){
        const {signUpForm} = this.state;
        const updatedForm = Object.assign({}, signUpForm, { displayName })
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
                displayName: signUpForm.displayName,
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
        this.api.post({
            endpoint: 'auth/login',
            body:{
                email, 
                password,
            }
        })
        .then(({ access_token }) => {
                //console.log(access_token);
                this.setState({
                    access_token,
                });
                this.api = API(access_token);
                this.loadCurrentUser();
            })
        .catch(err => console.error(err));
    }

    loadCurrentUser(){
        this.loadUser({id: 'me'});
    }

    loadUser({id}){
        const userField = id === 'me' ? 'currentuser' : 'user';
        this.setState({
            [userField]: false,
        })
        this.api.get({
            endpoint: `api/users/${id}`,
        })
            .then(({email, displayName}) => {
                this.setState({
                    [userField]: {
                        email,
                        displayName
                    }
                });
            });
    }


    render(){
        const {currentuser, user, signUpForm, signInForm} = this.state; 
        
        return (
            <Router>
                <div>
                    <ul>
                        <li><Link to= "/app/signin">Sign in</Link></li>
                        <li><Link to= "/app/signup">Sign up</Link></li>
                        { currentuser && 
                            <li><Link to= "/app/user/me/profile">{currentuser.displayName}</Link></li>
                        }
                    </ul>
                    <div> 
                        <Route path="/app/signup" render= { () => (
                            <SignupForm
                                state={signUpForm}
                                onNameUpdate={this.onNameUpdate.bind(this)}
                                onEmailUpdate={this.onEmailUpdate.bind(this)}
                                onPasswordUpdate={this.onPasswordUpdate.bind(this)}
                                onSubmit={this.onSignUpSubmit.bind(this)}
                            /> 
                        )}/>
                        <Route path="/app/signin" render= { () => (
                            <SigninForm  
                                state={signInForm}
                                onEmailUpdate={this.onEmailUpdate.bind(this)}
                                onPasswordUpdate={this.onPasswordUpdate.bind(this)}
                                onSubmit={this.onSignInSubmit.bind(this)}
                            /> 
                        )}/>
                        <Switch>
                            <Route path="/app/user/me/profile"  render= { () => (<UserProfile user={currentuser}/>)}/>
                            <Route path="/app/user/:id/profile" render= { ({match}) => (
                                <UserProfile 
                                    user={user} 
                                    match={match}
                                    loadUser={this.loadUser.bind(this)}
                                />)}/>
                        </Switch>
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
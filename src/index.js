import React, { Component } from 'react';
import { render } from 'react-dom';
import io from 'socket.io-client';
import API from './api.js';

import SignupForm from './SignupForm.js';
import SigninForm from './SigninForm.js';
import UserProfile from './UserProfile.js';
import PeopleList from './PeopleList.js';
import MatchList from './MatchList.js';
import UploadPhoto from './UploadPhoto.js';
import "./styles.css";

//switch between showing/not showing based on authentication
const Protected = ({ authenticated, children }) => (
    authenticated ? children : null
);

import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link,
} from "react-router-dom";
import { withRouter } from 'react-router';
import { get } from 'mongoose';
import { sign } from 'jsonwebtoken';

class App extends Component {
    constructor(props) {
        super(props);
        const access_token = window.localStorage.getItem('access_token');
        this.state = {
            access_token,
            currentuser: null,
            user: null,
            matches: [],
            people: [],
            signInForm: {
                email: 'alice@example.com',
                password: '123123'
            },
            signUpForm: {
                displayName: 'Kasamats',
                email: 'kasamats@test.com',
                password: '123123'
            },
            uploadPhoto: {},
            messages: [],
        };
        this.api = API(access_token);
    }
    componentDidUpdate() {
        const { access_token } = this.state;
        window.localStorage.setItem('access_token', access_token);

    }

    componentDidMount() {
        const { access_token } = this.state;
        this.loadCurrentUser();

        //---- socket.io ----------
        const socket = io('http://localhost:8080');
        this.socket = socket;
        socket.on('getMsgs', messages => {
            this.setState({
                messages,
            });
        });

        socket.on('newChatMsg', msg => {
            this.setState({
                messages: [].concat(this.state.messages, msg),
            });
        })
    }

    sendChatMsg(text) {
        const msg = {
            sender: this.state.currentuser.displayName,
            text,
        };

        this.setState({
            messages: [].concat(this.state.messages, msg),
        });

        this.socket.emit('chatMsg', msg);
    }

    onNameUpdate(displayName) {
        const { signUpForm } = this.state;
        const updatedForm = Object.assign({}, signUpForm, { displayName })
        this.setState({
            signUpForm: updatedForm,
        })
    }
    onEmailUpdate(form, email) {
        const oldForm = this.state[form];
        const updatedForm = Object.assign({}, oldForm, { email })
        this.setState({
            [form]: updatedForm,
        })
    }
    onDescUpdate(form, desc) {
        const oldForm = this.state[form];
        const updatedForm = Object.assign({}, oldForm, { desc })
        this.setState({
            [form]: updatedForm,
        })
    }
    onAgeUpdate(form, age) {
        const oldForm = this.state[form];
        const updatedForm = Object.assign({}, oldForm, { age })
        this.setState({
            [form]: updatedForm,
        })
    }
    onLocationUpdate(form, location) {
        const oldForm = this.state[form];
        const updatedForm = Object.assign({}, oldForm, { location })
        this.setState({
            [form]: updatedForm,
        })
    }
    onEthnicityUpdate(form, ethnicity) {
        const oldForm = this.state[form];
        const updatedForm = Object.assign({}, oldForm, { ethnicity })
        this.setState({
            [form]: updatedForm,
        })
    }
    onPasswordUpdate(form, password) {
        const oldForm = this.state[form]
        const updatedForm = Object.assign({}, oldForm, { password })
        this.setState({
            [form]: updatedForm,
        })
    }
    onPPUpdate(form, PP) {
        const oldForm = this.state[form]
        const updatedForm = Object.assign({}, oldForm, { PP })
        this.setState({
            [form]: updatedForm,
        })
    }
    onSignUpSubmit() {
        const { signUpForm } = this.state;

        fetch(
            'http://localhost:8080/auth/signup',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: signUpForm.email,
                    displayName: signUpForm.displayName,
                    password: signUpForm.password,
                    location: signUpForm.location,
                    age: signUpForm.age,
                    desc: signUpForm.desc,
                    ethnicity: signUpForm.ethnicity,
                    PP: signUpForm.PP,
                }),
            }
        ).then(data => data.json())
            .then(({ access_token }) => {
                console.log(access_token);
                this.setState({
                    access_token,
                }); this.setState({
                    currentuser: {
                        displayName: signUpForm.displayName,
                        email: signUpForm.email,
                        location: signUpForm.location,
                        age: signUpForm.age,
                        desc: signUpForm.desc,
                        ethnicity: signUpForm.ethnicity,
                        PP: signUpForm.PP,
                    },
                    signUpForm: {
                        displayName: '',
                        email: '',
                        password: '',
                        location: '',
                        age: '',
                        desc: '',
                        ethnicity: '',
                        PP: '',
                    },
                });
                this.api = API(access_token);
                this.loadCurrentUser();
            })
            .catch(err => console.error(err));

    }
    onSignInSubmit() {
        const {
            signInForm: {
                email,
                password,
            },
        } = this.state;

        //api call to use email and password
        fetch(
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
                this.setState({
                    access_token,
                });
                this.api = API(access_token);
                this.loadCurrentUser();
            })
            .catch(err => console.error(err));
    }

    loadCurrentUser() {
        this.loadUser({ id: 'me' });
    }

    loadUser({ id }) {
        const userField = id === 'me' ? 'currentuser' : 'user';
        this.setState({
            [userField]: false,
        })
        this.api.get({
            endpoint: `api/users/${id}`,
        })
            .then(({ _id, email, displayName, location, age, ethnicity, desc, PP }) => {
                this.setState({
                    [userField]: {
                        _id,
                        email,
                        displayName,
                        location,
                        age,
                        ethnicity,
                        desc,
                        PP
                    }
                });
            });
    }

    //functionally preserving state
    loadPeople() {
        this.api.get({
            endpoint: 'api/users',
        }).then(({ users }) => {
            this.setState({ people: users });
        });
    }

    loadMatches() {
        this.api.get({
            endpoint: 'api/users/matches',
        }).then(({ users }) => {
            this.setState({ matches: users });
        });
    }

    vote(upOrDown, id) {
        this.api.get({
            endpoint: `api/users/${id}/vote/${upOrDown}`,
        })
    }

    voteUp(id) {
        this.vote('up', id);
    }

    voteDown(id) {
        this.vote('down', id);
    }

    render() {
        const { currentuser, user, signUpForm, signInForm, people, matches, uploadPhoto } = this.state;

        return (
            <Router>
                <div class="central">
                    <div align="center">
                        <iframe src="https://giphy.com/embed/YkdDRLd5KVsE8YzOZs" width="100" height="100" frameBorder="0"></iframe>
                    </div>
                    <h1>Pairs</h1>
                    <div class="dropdown">
                        <span>Menu</span>
                        <div class="dropdown-content">
                            <p><Link to="/app/signin">Sign in</Link></p>
                            <p><Link to="/app/signup">Sign up</Link></p>
                            <p><Protected authenticated={!!currentuser}>
                                <Link to="/app/user/me/profile">{currentuser && currentuser.displayName}</Link>
                            </Protected></p>
                            <p><Protected authenticated={!!currentuser}>
                                <Link to="/app/people">People</Link>
                            </Protected></p>
                            {/* <Protected authenticated={!!currentuser}>
                            <li><Link to="/app/matches">Matches</Link></li>
                            </Protected>
                            <li><Link to="/app/uploadPP">Upload Profile Pic</Link></li> */}
                        </div>
                    </div>
                    <div>
                        <Route path="/app/signup" render={() => (
                            <SignupForm
                                state={signUpForm}
                                onNameUpdate={this.onNameUpdate.bind(this)}
                                onEmailUpdate={this.onEmailUpdate.bind(this)}
                                onPasswordUpdate={this.onPasswordUpdate.bind(this)}
                                onDescUpdate={this.onDescUpdate.bind(this)}
                                onAgeUpdate={this.onAgeUpdate.bind(this)}
                                onLocationUpdate={this.onLocationUpdate.bind(this)}
                                onEthnicityUpdate={this.onEthnicityUpdate.bind(this)}
                                onPPUpdate={this.onPPUpdate.bind(this)}
                                onSubmit={this.onSignUpSubmit.bind(this)}
                            />
                        )} />
                        <Route path="/app/uploadPP" render={() => (
                            <UploadPhoto
                                state={uploadPhoto}
                                onPPUpdate={this.onPPUpdate.bind(this)}
                                onSubmit={this.onUploadPPSubmit.bind(this)}
                            />
                        )} />
                        <Route path="/app/signin" render={() => (
                            <SigninForm
                                state={signInForm}
                                onEmailUpdate={this.onEmailUpdate.bind(this)}
                                onPasswordUpdate={this.onPasswordUpdate.bind(this)}
                                onSubmit={this.onSignInSubmit.bind(this)}
                            />
                        )} />
                        <Route path="/app/people" render={() => (
                            <PeopleList
                                people={people}
                                loadPeople={this.loadPeople.bind(this)}
                            />
                        )} />
                        <Route path="/app/matches" render={() => (
                            <MatchList
                                matches={matches}
                                loadMatches={this.loadMatches.bind(this)}
                            />
                        )} />
                        <Switch>
                            <Route path="/app/user/me/profile" render={() => (
                                <UserProfile
                                    user={currentuser}
                                    onSend={this.sendChatMsg.bind(this)}
                                    messages={this.state.messages}
                                />)} />
                            <Route path="/app/user/:id/profile" render={({ match }) => (
                                <UserProfile
                                    user={user}
                                    messages={this.state.messages}
                                    match={match}
                                    loadUser={this.loadUser.bind(this)}
                                    onUp={this.voteUp.bind(this)}
                                    onDown={this.voteDown.bind(this)}
                                    onSend={this.sendChatMsg.bind(this)}
                                />)} />
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
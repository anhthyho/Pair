import React, { Component } from 'react';
import {withRouter} from 'react-router';
class SignupForm extends Component{
    render(){
        const {
            state: {
                displayName, email, password, desc, age, ethnicity, location, PP
            }, 
            onNameUpdate,
            onEmailUpdate,
            onPasswordUpdate,
            onDescUpdate,
            onLocationUpdate,
            onEthnicityUpdate,
            onAgeUpdate,
            onPPUpdate, 
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
                        value = {displayName}
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
                    <input 
                        type="desc" 
                        onChange={e => onDescUpdate(FORM_NAME, e.target.value)}
                        value = {desc}
                        placeholder="Talk about yourself!"/>
                </div>
                <div>
                    <input 
                        type="age" 
                        onChange={e => onAgeUpdate(FORM_NAME, e.target.value)}
                        value = {age}
                        placeholder="Age"/>
                </div>
                <div>
                    <input 
                        type="ethnicity" 
                        onChange={e => onEthnicityUpdate(FORM_NAME, e.target.value)}
                        value = {ethnicity}
                        placeholder="Ethnicity"/>
                </div>
                <div>
                    <input 
                        type="location" 
                        onChange={e => onLocationUpdate(FORM_NAME, e.target.value)}
                        value = {location}
                        placeholder="Location"/>
                </div>
                <div>
                    <input 
                        type="PP" 
                        onChange={e => onPPUpdate(FORM_NAME, e.target.value)}
                        value = {PP}
                        placeholder="Profile Picture Link"/>
                </div>
                <div>
                    <button type="button" onClick={ () => {
                        onSubmit(); 
                        history.push('/app/user/profile');
                    }}>Continue</button>
                </div>

            </div>
          );
    }
}
const SignUpFormWithRouter = withRouter(SignupForm); 
export default withRouter(SignupForm);
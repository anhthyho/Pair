import React, { Component } from 'react';
class UserProfile extends Component{
    render(){
        const {user, match, loadUser} = this.props;
        //waiting to load profile page 
        if (user === null){

            if (match && match.params.id){
                loadUser({id: match.params.id});
            }
        }

        if (user===null || user === false){
            return (
                <div>
                    <h2>Loading...</h2>
                </div>
            );
        }
        return(
            <div>
                <h2>User Profile</h2>
                <span>Hi {user.displayName}</span>
            </div>
            
        );
    }
}

export default UserProfile;
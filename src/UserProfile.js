import React, { Component } from 'react';
class UserProfile extends Component{
    componentDidMount(){
        const {user, match, loadUser} = this.props; 
        if (match && match.params.id){
            loadUser({id: match.params.id});
        }
        
    }
    render(){
        const {user, onUp, onDown} = this.props;
        //waiting to load profile page 
        

        if (user===null || user === false){
            return (
                <div>
                    <h2>Loading...</h2>
                </div>
            );
        }
        console.log(user);
        return(
            <div>
                <h2>User Profile</h2>
                <span>Hi {user.displayName}</span>
                <div>
                    <button onClick={()=>onUp(user._id)}>
                        Like
                    </button>
                    <button onClick={()=>onDown(user._id)}>
                        Pass
                    </button>
                </div>
            </div>
            
        );
    }
}

export default UserProfile;
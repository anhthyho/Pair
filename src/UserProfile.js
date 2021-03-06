import React, { Component } from 'react';
import "./styles.css";
class UserProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chatInputText: '',
        }

        this.onUpdateInput = e => {
            this.setState({
                chatInputText: e.target.value,
            });
        };
        this.sendMsg = e => {
            e.preventDefault();
            props.onSend(this.state.chatInputText);
            this.setState({
                chatInputText: '',
            });
        };
    }
    componentDidMount() {
        const { user, match, loadUser } = this.props;
        if (match && match.params.id) {
            loadUser({ id: match.params.id });
        }

    }
    render() {
        const {
            user,
            onUp,
            onDown,
            messages = [],
            onSend,
        } = this.props;
        //waiting to load profile page 

        const { chatInputText } = this.state;
        if (user === null || user === false) {
            return (
                <div>
                    <h2>Loading...</h2>
                </div>
            );
        }
        //console.log(user);
        return (
            <div class="central">
                <h5>{user.displayName}</h5>
                <div class="bio">
                    <h4>Age: {user.age}</h4>
                    <h4>Location: {user.location}</h4>
                    <h4>Ethnicity: {user.ethnicity}</h4>
                    <h4>About me: {user.desc}</h4>
                    
                </div>
                <div class="prof"><img src={user.PP} alt={user.displayName} /></div>
                <div class="like">
                    <button onClick={() => onDown(user._id)}>
                        Pass
                    </button>
                    <button onClick={() => onUp(user._id)}>
                        Like
                    </button>
                </div>
                <h3>Chat</h3>
                <div class="chat">
                    {
                        messages.map((msg, index) => (
                            <div class="darker" key={index}>
                                <b>{msg.sender}: </b>
                                <span>{msg.text}</span>
                            </div>
                        ))
                    }
                    <div id="anchor"></div>
                </div>
                <form onSubmit={this.sendMsg}>
                        <input
                            onChange={this.onUpdateInput}
                            value={chatInputText}
                        />
                    </form>
            </div>
        );
    }
}

export default UserProfile;
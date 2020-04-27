import React, { Component } from 'react';
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
            <div>
                <h2>User Profile</h2>
                <span>Hi {user.displayName}</span>
                <div>
                    <button onClick={() => onDown(user._id)}>
                        Pass
                    </button>
                    <button onClick={() => onUp(user._id)}>
                        Like
                    </button>
                </div>
                <div>
                    <h3>Chat</h3>
                    {
                        messages.map((msg,index) => (
                            <div key={index}>
                                <b>{msg.sender}: </b>
                                <span>{msg.text}</span>
                            </div>
                        ))
                    }
                    <form onSubmit={this.sendMsg}>
                        <input
                            onChange={this.onUpdateInput}
                            value={chatInputText}
                        />
                    </form>
                </div>
            </div>
        );
    }
}

export default UserProfile;
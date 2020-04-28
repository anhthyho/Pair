import React, { Component } from 'react';
import {
    Link
} from 'react-router-dom';

class PeopleList extends Component {
    componentDidMount() {
        if (this.props.people.length === 0) {
            this.props.loadPeople();
        }
    }
    render() {
        const {
            people,
        } = this.props;
        return (
            <div class="central">
                <h3>Choose your pair!</h3>
                {
                    people.map(person =>
                        <div key={person._id}>
                            <div class="pic"><img src={person.PP} alt={person.displayName} /></div>
                            <div class="list">
                                <h2><Link to={`/app/user/${person._id}/profile`}>
                                    {person.displayName}
                                </Link></h2>
                                <span>{person.desc}</span>
                            </div>
                        </div>
                    )
                }

            </div>
        );
    }
}

export default PeopleList; 
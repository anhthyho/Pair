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
            <table>
                <tbody>
                    {
                        people.map(person =>
                            <tr key={person._id}>
                                <td>
                                    {person.displayName}
                                </td>
                                <td>
                                    <Link to={`/app/user/${person._id}/profile`}>
                                        Details
                                    </Link>
                                </td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        );
    }
}

export default PeopleList; 
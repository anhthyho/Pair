import React, { Component } from 'react';
import {
    Link
} from 'react-router-dom';

class MatchList extends Component {
    componentDidMount() {
        if (this.props.matches.length === 0) {
            this.props.loadMatches();
        }
    }
    render() {
        const {
            matches,
        } = this.props;
        return (
            <div>
                <h3>Your Matches</h3>
                <table>
                    <tbody>
                        {
                            matches.map(person =>
                                <tr key={person._id}>
                                    <td>
                                        {person.displayName}
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default MatchList; 
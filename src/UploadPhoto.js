import React, { Component } from 'react';
import {withRouter} from 'react-router';
class UploadPhoto extends Component{
    render(){
        const {
            state: {
                PP
            }, 
            onPPUpdate,
            onSubmit,
            history,
        } = this.props;

        const FORM_NAME = 'UploadPhoto';
        
        return(
            <div>
                <div>
                <h2>Upload A Photo of Yourself!</h2>
                <form action="/upload" method="post" encType="multipart/form-data">
                        <input 
                            type="file" 
                            accept="image/*" 
                            name="photo" 
                            onChange={e => onPPUpdate(FORM_NAME, e.target.value)}
                            value = {PP}/>
                    </form>
                </div>
                <div>
                    <button type="button" onClick={ () => {
                        onSubmit(); 
                        history.push('/app/user/profile');
                    }}>Upload</button>
                </div>

            </div>
          );
    }
}

const UploadPhotoWithRouter = withRouter(UploadPhoto); 
export default withRouter(UploadPhoto);
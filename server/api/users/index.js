const express = require('express');
const router = express.Router(); 

module.exports= isAuthenticated =>{
    router.use('/me', isAuthenticated,(req, res)=>{
            res.json(req.user); 
    });
    return router;
}; 
const express = require('express');
const router = express.Router();

module.exports = (db, isAuthenticated) => {
    const User = require('../../models/user')(db);
    router.use('/me', isAuthenticated, (req, res) => {
        res.json(req.user);
    });

    router.get('/:id', isAuthenticated, (req, res) => {
        const { id } = req.params;
        User.findById(id, '-hashedPassword -salt').then(user => {
            res.json(user);
        });
    });

    router.get('/:id/vote/up', isAuthenticated, (req, res) => {
        const { user, params: { id } } = req;
        if (!user.scores) {
            user.scores = {};
        }
        user.scores[id] = user.scores[id] ? (user.scores[id] + 1) : +1;
        //console.log(user.scores[id]);
        user.save().then(res.json({ score: user.scores[id] }));
    });

    router.get('/:id/vote/down', isAuthenticated, (req, res) => {
        const { user, params: { id } } = req;

        if (!user.scores) {
            user.scores = {};
        }
        user.scores[id] = user.scores[id] ? (user.scores[id] - 1) : -1;
        user.save().then(res.json({ score: user.scores[id] }));
    });

    router.get('/', isAuthenticated, (req, res) => {
        const { user } = req;

        User.find({}, '-hashedPassword -salt').then(users => {

            console.log(user);
            //list of all users
            res.json({
                users,
            });
        });
    });
    return router;
}; 
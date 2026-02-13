import * as trelloService from '../services/trello.mjs'; //TODO: actually get the data

export const viewHome = async (req, res) => {
    try {
        res.render('home', {
            pageTitle: 'Home'
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
};

// change below here once we actually have a data source
export const viewDashboard = async (req, res) => {
    try { 
        res.render('dashboard', { 
            pageTitle: 'Dashboard'
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};
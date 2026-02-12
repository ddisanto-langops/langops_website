import * as trelloService from '../services/trello.mjs';

export const viewHome = async (req, res) => {
    try {
        res.render('home', {
            pageTitle: 'Home'
        });

    } catch (error) {
        res.status(500).send("Error loading homepage");
    }
}

// change below here once we actually have a data source
export const viewDashboard = async (req, res) => {
    try { 
        // Render the Pug file and inject the data
        res.render('dashboard', { 
            pageTitle: 'Dashboard'
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};
//this is natalie--test

const mysql = require('mysql');
const inq = require('inquirer');
const pwd = require('./dontlook');


const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Be sure to update with your own MySQL password!
    password: pwd,
    database: "auctiondb",
});

const start = () => {
    
    inq
        .prompt([
            {
                type: 'list',
                message: 'Do you wish to POST an item or BID on an item?',
                name: 'choice',
                choices: ['POST', 'BID', "EXIT"],
            },
        ])
        .then((data) => {
            if(data.choice === 'POST') {
                postAuction();
            } else if (data.choice === 'BID') {
                bidAuction();
            } else {
                return;
            }
        });
};  

const postAuction = () => {
    inq
    .prompt([
        {
        type: 'input',
        name: 'item',
        message: "What is the item?",
        // validate: validateString,
        },
        {
        type: 'input',
        message: "What is the category?",
        name: 'category',
        // validate: validateNumber,
        
        },
        {
        type: 'input',
        message: "What is the starting bid?",
        name: 'bid',
        // validate: validateEmail,
        
        },

    ])
    .then((data) => {
        const query = connection.query('INSERT INTO items SET ?',
        {
            itemName: data.item,
            category: data.category,
            startingBid: data.bid,
            highBid: 0 
        },(err,res)=>{
            if(err) throw err;
            console.log(`${res.affectedRows} product inserted`)
        });
    
        console.log(query.sql);
    });
}

const updateBid = (highBid, bidChoice) =>
{

    console.log(highBid, bidChoice);
    connection.query('UPDATE items SET ? WHERE ?', [{highBid:highBid}, {itemName:bidChoice}],(err,res) =>
                {
                    if(err) throw err;
                    console.log(`Updated the highest bid for ${bidChoice}`);
                });
}

const bidAuction = () =>
{
    const arr = [];

    connection.query('SELECT * FROM items', (err, res) => {
        if (err) throw err;
        // Log all results of the SELECT statement
        res.forEach((data) =>
        {
            console.log(data.itemName);
            arr.push(data.itemName);
        })

    inq.prompt([
            {
                type: 'list',
                name: 'bidChoice',
                message: "What do you want to bid on?",
                choices: arr,
            },
            {
                type: 'input',
                name: 'userBid',
                message: "How much do you want to bid?",
            },
        ])
        .then((data) =>
        {   
            connection.query('SELECT * FROM items WHERE itemName = ?', 
            [data.bidChoice], (err, res) =>
            {
                if(err) throw err;
                if((data.userBid > res.highBid && data.userBid > res.startingBid) || res.highBid == null)
                {
                    updateBid(data.userBid, data.bidChoice);
                }
                else
                {
                    console.log('The bid is already higher than that.');
                }
            });
        });

    });
};
    




connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    start();
  });
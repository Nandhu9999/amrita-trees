// Utilities we need
const fs = require("fs");

// Initialize the database
const dbFile = "./.data/mydb.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    try {
      if (!exists) {
        
        console.log("db doesnt exist")
        await db.run("CREATE TABLE Members (socketid TEXT, username TEXT)");

      } else {
        
        console.log("db exists")
        await db.run("DELETE FROM Members");
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

// Our server script will call these methods to connect to the db
module.exports = {

  /**
   * Process a user vote
   *
   * Receive the user vote string from server
   * Add a log entry
   * Find and update the chosen option
   * Return the updated list of votes
   */
  processVote: async vote => {
    // Insert new Log table entry indicating the user choice and timestamp
    try {
      // Check the vote is valid
      const option = await db.all("SELECT * from Choices WHERE language = ?",vote);
      if (option.length > 0) {
        // Build the user data from the front-end and the current time into the sql query
        await db.run("INSERT INTO Log (choice, time) VALUES (?, ?)", [vote,new Date().toISOString()]);
        // Update the number of times the choice has been picked by adding one to it
        await db.run("UPDATE Choices SET picks = picks + 1 WHERE language = ?",vote);
      }

      // Return the choices so far - page will build these into a chart
      return await db.all("SELECT * from Choices");

    } catch (dbError) {
      console.error(dbError);
    }
  },

  getMembers: async () => {
    try {
      return await db.all("SELECT * FROM Members");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  addMember: async (socketid, username) => {
    try {
      await db.run("INSERT INTO Members (socketid, username) VALUES (?, ?)", [socketid, username])
    } catch (dbError) {
      console.error(dbError);
    }
  },

  deleteMember: async (socketid) => {
    try {
      await db.run("DELETE FROM Members where socketid=?", [socketid])
    } catch (dbError) {
      console.error(dbError);
    }
  },
  
  clearMembers: async () => {
    try {
      await db.run("DELETE FROM Members", [])
    } catch (dbError) {
      // output removed because it causes error
      // even though it works fine, it might be
      // caused by an already empty table, not 
      // sure
      console.error();
    }
  },




  // runQuery1: async (q) => {
  //   try {
  //     return await db.all(q);
  //   } catch (dbError) {
  //     console.error(dbError);
  //   }
  // },
  // runQuery2: async (q) => {
  //   try {
  //     return await db.run(q);
  //   } catch (dbError) {
  //     console.error(dbError);
  //   }
  // }
};

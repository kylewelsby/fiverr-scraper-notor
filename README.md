# Notor Scraper

This script navigates to [notar.de](http://www.notar.de) and downloads land registry details into JSON and CSV format.

## Installation

This code is dependant on [Node.JS](https://nodejs.org), please download and install the latest stable version (at time of writing v6.6.0).

Navigate to this code directory and execute the following command to install dependancies

    npm install

## Running the script

A file `input.txt` is the input for the script, each query must be on a new line.

The script will query each line and find the corresponding ID and collect the data from all the pages if more than 1.

To run the script simply run

    npm start

The captured data will be saved to `./data/` folder.  You will find all available formats collecting data as the script is running.  You do not have to wait until the script is complete to view the data. 

When running the script, at any time you can observe `./data/_meta.json` for the current status.  

Example metadata:

    {
      "startAt": "2016-09-20T19:22:22.964Z",
      "requests": 13,
      "pages": 12,
      "results": 89
    }


## Development

If you're a keen developer,  you can easily adapt the script to whatever you like. Some tests are written to be able to ensure the script works with an defined fixtures in `./app/fixtures`.

To run the tests execute:

    npm test

## License

See [LICENSE](./LICENSE.md)

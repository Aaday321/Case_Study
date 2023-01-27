1. Organize code so that all functions that are not dealing with state are in a seprate controllers file
	1a. All functions that are operating on simaler data, group them into an object

2. Create a worker thread to handle the organizing of all data
	2a. Make one of the operations of the worker thread to grab all feilds from the data for later search

3. Add an "advanced search" feature that searches all data feilds

4. Make the App redo the data hit every 20 seconds and redo the inital hit every 1 minute

5. Make the user interface look nice

6. Add the export to XSL file feature
	6a. Make sure that this feautre grabs ALL the data from the API before processing the export

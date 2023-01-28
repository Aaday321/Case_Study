DONE - 1. Organize code so that all functions that are not dealing with state are in a seprate controllers file
DONE -  	1a. All functions that are operating on simaler data, group them into an object

NOT WORKING 2. Create a worker thread to handle the organizing of all data
         	2a. Make one of the operations of the worker thread to grab all feilds from the data for later 
search
--This requires extra libraries to use an import statement in a worker file. I will absolutly learn how to do 
this, but for now let's just get the project turned in on time lol.

3. Add an "advanced search" feature that searches all data feilds
--If I have time, I will do this after I add some export options

DONE 4. Make the App redo the data hit every 20 seconds and redo the inital hit every 1 minute

DONE 5. Make the user interface look nice

DONE 6. Add the export to XSL file feature
NOT DOING THIS ->	6a. Make sure that this feautre grabs ALL the data from the API before processing the 
export
--Not dong this because this will require an server-side app to process the request due to the limits set by the 
API. Maybe I'll do it if I finish everything else on this list first

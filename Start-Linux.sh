#!/bin/bash

#Clear Temporary Files
if [ -d "./temp/" ]; then
	echo Deleting Temporary Files...
	rm -r "./temp/"
fi

#Make temp Directory if one does not exist
if [ ! -d "./temp/" ]; then
	mkdir temp
fi

#While the file QUIT does not exist in temp RUN
while [ ! -f "./temp/QUIT" ]; do

	#If the file UPDATE exists
	if [ -f "./temp/UPDATE" ]; then
		echo Updating...
		git pull
		echo Finished Update!
	fi

	#Run Kaffee Bot
	node KaffeeBot.js
done

echo Quiting Kaffee Bot Loop...
sleep 15
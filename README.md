# TOHacks-2020
Hackathon project for TOHacks 2020

## Inspiration

One of the largest dangers of Coronavirus is its ability to spread to others without the carrier ever even displaying any symptoms. CoTracing was made to address the current need for precise and efficient tracking of individuals infected with COVID-19 while also respecting their right to privacy. Using Google’s location services and crowdsourcing, our application allows users to check if they have been in contact with someone who has tested positive and subsequently prompts them to contact a medical professional.

## What it does

Using location data that the user downloads from Google Takeout, CoTracing goes through all of the locations that the user has visited within a given time period and uses the powerful DCP technology to compare it with a database of confirmed positive Covid-19 patients. If the two are found to have been in the same place within a certain time buffer (which can be adjusted as more research about the longevity of the virus is released) , the user is notified and is then prompted to get tested. As more Covid-19 positive users donate their data, the app gets more and more effective. Furthermore, in order to ensure safety of confidential data, all the processing of data occurs on the client-side. In addition, the patient data is culminated in a heat map that indicates recent locations of COVID-19 patients.


## How we built it


Our web app was built using HTML, css and javascript. We started off by creating the graphical user interface in html and css while using javascript to link it to Firebase and the Google Maps API. The firebase realtime-database was used for the anonymous storage of Covid-19 positive patients and we used the Google Maps API for a user-friendly visualization of places that had been visited recently by COVID-19 patients. As comparing a user’s data to all the data of Covid-19 patients is intensive, we took advantage of DCP’s powerful system. With a time complexity of O(n3), this is a perfect demonstration of the technology. In a major city such as Toronto, there are currently 6000 reported COVID-19 cases. With 6k patients each visiting 125 locations a month, you would need to use your 125 locations to make a total of  93.75 million comparisons. Keep in mind that these comparisons need to be run for every user of the website in order to create this ultra-local COVID-19 hotspot map and tell the user if, where, and when they have been in contact with a confirmed COVID-19 patient.


## Challenges we ran into

As with all projects, we ran into some challenges while developing our program. Our first hurdle was that while making firebase requests for the location history of positive Covid-19 cases, each request had a small latency associated with it, meaning that over the course of the thousands of requests we were making, there was a large delay. In order to fix this, we instead imported the whole patient database at the start, and then iterated through it. Furthermore, as this was our first experience with DCP, using the service as was intended proved to be a challenge at first, with points where almost none of our code worked. Luckily, through reference to the documentation and the help of Ryan Rossiter at DCL, we were able to get up and running!



## Accomplishments that we're proud of/ What we learned


The opportunity to learn more about the emerging technology of distributed computing was very exciting and as we knew we had a good use case for the protocol, we were even more motivated. Through this project, we were able to learn how to integrate the technology within a full web app and we are quite proud of its performance, exceeding what we were expecting from a proof-of-concept implementation. We genuinely feel that DCP is a very unique technology and we were astounded by the performance benefits. It allowed our app to efficiently scale to comparisons of hundreds of patients, because it distributes the tasks to many devices on the network.
In addition, we were quite proud of our implementation of the google cloud API’s. Through the workshops, we have learned how relevant and ubiquitous google cloud products were. For this reason, we decided to learn more about them and integrate them into our web-app. We feel that the success of the google cloud API’s can be attributed to their universality and relevance to programmers. It is for this reason that all of us were very eager to learn how to implement these products into our projects.
Finally, we were proud of our user-friendly and quite relevant web-app. Although we have all learned the typical web development languages (HTML, CSS, JavaScript), most of our team members have not made a web-app that was this unique and relevant to current issues. In addition, we were quite proud of the ease of use and accessible interface that we created. During the process, we have learned the ups and downs of full stack developers. As high school students and aspiring software engineers, we felt that this web-app was a great way to get our feet wet in the full stack development world.


## What's next for CoTracing

We found the process of making CoTracing very rewarding and therefore look forward to continuing to develop upon the product we have created in this short amount of time. The main optimization for the foreseeable future would be to determine general location trends for each user and making clusters of users, thus reducing the amount of testing that needs to be done. Additionally, a machine learning algorithm could be implemented to detect trends among the users of the service, and to detect hotspots of transmission to avoid. Finally, our goal would be easier submission of personal data. Instead of manually submitting a location history JSON file, the ideal interface would automatically query user data, possibly from a mobile app, at the click of a button. We feel that these goals are quite feasible as we continue to develop CoTracing in the coming weeks.

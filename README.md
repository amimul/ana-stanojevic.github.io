# EPFL: DATA VISUALIZATION (COM-480) 
##### Ana Stanojevic, Sergii Shynkaruk, Mohammad Aquil

In this project we wanted to visualize marine plastic [litter, debris, etc.] pollution, all over the world.

## Run
Use **GOOGLE CHROME** browser to open our web site https://ana-stanojevic.github.io/. 
  - To open process book, click on the **Process book** link.
  - To open vizualization, click on the **Map** link.
  
      The default page of our vizualization is **_Overview_** web page. Use three buttons in the left down corner of each page to switch to wanted visualization, at any moment.
      
      **_Overview_** page usage: 
        Click button *Oceans' statistics* at the bottom of the page to open chart. Explore Sankey chart by hovering over               different parts of it. Use two buttons on the right side of the chart, to switch between two types of measuring (weight and nubmer of pieces).
        
      **_Expeditions_** page usage:
        Explore in interactive was available expedition paths. Position mouse onto displayed polylines or points highlights focused expedition. Repeating only for points also synchronously highlights corresponding packing layout (this interaction works reversively).
        Circle packing layouts demonstrate amount of garbage for every expedition and expedition point. It provides interactive behavior for mid-level nodes (expeditions) and finest nodes(expedition points). 
        Put mouse cursor on mid-level circles, it highlights appropriate expedition path. Repeat this action for the most nested circles, and observe relevant expedition point. Perform mouse click on the finest circles to observe date and bar-chart diagram for every expedition point in a zoom setting. Click on its siblings to move from one point to another. Click on the same point or on the host-circle to perform zoom-out and to go back to initial state.
                
      **_Spreading_** page usage:
        Click on any of 11 providide points to start animation showing the possible directions in which garbage thrown at that         point, going to spread. During the animation, observe different types of edges, which are corelated with different             probabilities. When the animation is over, click on DEL to delete it from the screen.
### Special Remark
If the internet is too slow, map can't be loaded and the error will appear in conosle. Hence, please make sure that you have good internet connection when using the visualization.

## Directories
- data, contains two different data sets which we visualized
- preprocessing, contains python code which we used for data processing.
- src, contains some auxiliary code and functions

## Files
- index.md - starting web page of our vizualization
- _config.yml - theme of starting web page of our vizualization
- Map_Overview.html - overview visualization
- Map_expeditions.html - vizualisation of expeditions
- Map_spreading.html - visualization of spreading
- Process_book.pdf - final report.

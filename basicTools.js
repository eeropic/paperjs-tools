(function(global) {

  console.log('loading ext tools');
  
  
  with(paper){
  
    console.log(project)
  
  function ToolPen(project){
      this.tool=new Tool();
      this.tool.snap=true;
      this.tool.gridSize=20;
      this.tool.buttonClass="icon-fountain-pen";
      this.tool.on({
          mousedown:function(event){
              this.draw=true;
              var hitTest=project.hitTest(event.point, {tolerance:2,fill:true,stroke:true,handles:true,segments:true,selected:true});
              
              if(hitTest!=null){
                  if(hitTest.type=='segment'){
                      if(hitTest.segment==hitTest.item.lastSegment){
                          this.path=hitTest.item;
                      }
                      if(hitTest.segment==hitTest.item.firstSegment){
                          hitTest.item.reverse();
                          this.path=hitTest.item;
                      }                    
                  }
                  if(hitTest.type=='fill' || hitTest.type=='stroke'){
                      var insertLocation=hitTest.item.getNearestLocation(event.point);
                      var insertPoint=hitTest.item.getNearestPoint(event.point);
                      if(insertLocation.segment!=hitTest.item.firstSegment){
                          //this.insertedSegment=hitTest.item.insert(insertLocation.index+1,insertPoint);
                             if(!hitTest.item.closed){
                              var splitPath=hitTest.item.split(insertLocation)
                              this.path=hitTest.item.join(splitPath);
                             }
                             else{
                                this.path=hitTest.item.split(insertLocation).join() 
                             }
                              this.insertedSegment=this.path.segments[hitTest.item.getNearestLocation(event.point).index];
                              this.draw=false;
                              project.deselectAll();
                              this.insertedSegment.selected=true;
  
                    
                      }
                  }
                  
              }
              
              if(!event.modifiers.option){
                  if(this.path==null){
                      if(this.draw){
                          project.deselectAll();
                          this.path=new Path();
                          this.path.add((this.snap)?(event.point.divide(this.gridSize)).round().multiply(this.gridSize):event.point)
                          this.path.selected=true;
                      }
                  }    
                  else{
  //check if we can close the path                    
                      var closePt=this.snap?(event.point.divide(this.gridSize)).round().multiply(this.gridSize):event.point;
                      var closeTest=this.path.hitTest(closePt, {ends:true});
                      if(closeTest!=null){
                           if(closeTest.segment==this.path.firstSegment){
                              this.path.closed=true;
                              this.path.lastSegment.selected=false;
                              this.path.firstSegment.selected=true;
                              this.path=null;
                              return;
                          }    
                      }
                      else{
                          if(this.draw){
                          this.path.add((this.snap)?(event.point.divide(this.gridSize)).round().multiply(this.gridSize):event.point)
                      
                          }        
                      }
                  }
                  
                  if(this.draw){
                      var seg=this.path.lastSegment;
                      this.path.segments[Math.max(0,seg.index-1)].selected=false;
                      seg.selected=true;
                  }
          
              }
  
          },
          mousemove:function(event){
              var hitTest=project.hitTest(event.point, {fill:true,stroke:true,segments:true,selected:true,ends:false});
              if(hitTest!=null){
                  if(hitTest.type=="stroke"){
                  }
                  if(hitTest.type=="segment"){   
                  }
              }
          },        
          mousedrag:function(event){
              if(this.path!=null){
                  if(this.draw)var seg=this.path.lastSegment;
                  else var seg=this.insertedSegment;
                  
                  var dragPoint=(this.snap)?((event.point.subtract(seg.point)).divide(this.gridSize)).round().multiply(this.gridSize):event.point.subtract(seg.point);
                  if(event.modifiers.shift)dragPoint.angle=Math.round(dragPoint.angle/45)*45;
                  if(seg!=this.path.firstSegment)seg.handleIn=dragPoint.rotate(180)
                  seg.handleOut=dragPoint;
              }
          },
          mouseup:function(event){
          },
          keydown:function(event){
              switch(event.key){
                  case 'escape':
                      project.deselectAll();
                      this.path=null;
                      break;
  //                case 'enter':
  //                    this.path.closed=true;
  //                    project.deselectAll();
  //                    this.path=null;
  //                    break;
                  case 'meta':
                      toolDirectSelection.tool.activate();
                      break;
                  case 'alt':
                      toolDirectSelection.tool.activate();
                      break;                    
              }
          }
       
      });    
  }
  
  function ToolEyedropper(project){
      this.tool=new Tool();
      this.tool.buttonClass="icon-record";
      this.tool.on({
          mousedown:function(event){
              var hitTest=project.hitTest(event.point, {tolerance:2,fill:true,stroke:true,segments:true});
              console.log(hitTest)
              if(hitTest!=null){
                  if(hitTest.item){
                      if(!event.modifiers.alt){
                          project.currentStyle=hitTest.item.style;
                      }
                      if(event.modifiers.alt){
                          hitTest.item.style=project.currentStyle;
                      }
                  }
              }
          }
      });    
  }
  
  function ToolDirectSelection(project){
      this.tool=new Tool();
      this.tool.pentool=toolPen;
      this.tool.snap=true;
      this.tool.gridSize=20;
      this.tool.buttonClass='icon-arrow-white';    
      this.tool.on({
          mousedown:function(event){
              this.marqueePath=null;
            this.dragPosition=[];            
            this.dragSegmentPosition=[];
            this.selectedSegments=[];
            this.handleIn=null;this.handleOut=null;
            this.cloneItem=null;
            var hitTest=project.hitTest(event.point, {fill:true,stroke:true,handles:true,segments:true,center:false});
            var centerTest=project.hitTest(event.point, {tolerance:20,center:true});
              //(centerTest!=null)?hitResult=centerTest:0;
              
        if(hitTest!=null){
            
          var hitResult=hitTest;
  
          if(!hitResult.item.selected && !event.modifiers.shift)project.deselectAll();
  
          if(hitResult.type=='stroke' || hitResult.type=='fill' || hitResult.type=='center'){
            hitResult.item.selected=true;
            hitResult.item.bounds.selected=true;
            this.selectedSegments=[];
            this.handleIn=null;this.handleOut=null;
            if(event.modifiers.alt){
                this.cloneItems=[];
                for(var i in project.selectedItems){
                    this.cloneItems.push(project.selectedItems[i].clone())
                }
                project.deselectAll();
                for(var i in this.cloneItems)this.cloneItems[i].selected=true;
            }    
          }
  
          if(hitResult.type=='segment'){
              if(hitResult.segment.selected==false){
                  project.deselectAll();
                hitResult.segment.selected=true;
                hitResult.item.bounds.selected=false;
                this.selectedSegments=[];
                this.handleIn=null;this.handleOut=null;
                this.selectedSegments.push(hitResult.segment);
              }
              else if(hitResult.segment.selected==true){
                  this.selectedSegments=[];
                  //ugly hack recreate selectedSegments array
                  for(var i=0;i<project.selectedItems.length;i++){
                      for(var j=0;j<project.selectedItems[i].segments.length;j++){
                          if(project.selectedItems[i].segments[j].selected){
                              this.selectedSegments.push(project.selectedItems[i].segments[j])
                          }   
                      }
                  }
              
              }
            
          }
          
          if(hitResult.type=='handle-in' || hitResult.type=='handle-out'){
              if(hitResult.segment.selected){
                  this.selectedSegments=[];
                  this.selectedSegments.push(hitResult.segment);
                  if(hitResult.type=='handle-in'){
                      this.handleIn=hitResult.segment.handleIn;
                  }    
                  if(hitResult.type=='handle-out'){
                      this.handleOut=hitResult.segment.handleOut;
                  }
              }
              else{
                  //hack duplicate for when clicking handles of not selected
                      project.deselectAll();
                      toolPen.tool.path=null;
                      //var halfPixPt=new Point(0.5/view.zoom,0.5/view.zoom);
                      this.marqueePath=new Path();
                      var pt=event.point.add(halfPixPt);
                      this.marqueePath.add(pt,pt,pt,pt);
                      this.marqueePath.closed=true;
                      
                      this.marqueePath.style={
                          fillColor:null,
                          strokeWidth:1.0/view.zoom,strokeColor:'#BBB',
                          dashOffset:0.5/view.zoom,
                          dashArray:[1.0/view.zoom,1.0/view.zoom],
                      }
                      
                              this.marqueePath.blendMode='difference';
                              this.marqueePath.strokeScaling=false;
                      project.activeLayer.appendTop(this.marqueePath);				        
              }
          }
        }
        else{
          project.deselectAll();
          toolPen.tool.path=null;
          var halfPixPt=new Point(0.5/view.zoom,0.5/view.zoom);
          this.marqueePath=new Path();
          var pt=event.point.add(halfPixPt);
          this.marqueePath.add(pt,pt,pt,pt);
          this.marqueePath.closed=true;
          this.marqueePath.style={
              fillColor:null,
              strokeWidth:1.0/view.zoom,strokeColor:'#BBB',
              dashOffset:0.5/view.zoom,
              dashArray:[1.0/view.zoom,1.0/view.zoom],
          }
          
                  this.marqueePath.blendMode='difference';
                  this.marqueePath.strokeScaling=false;
          project.activeLayer.appendTop(this.marqueePath);
        }
  
          },
  
          mousedrag:function(event){
  
          //move item
             if(project.selectedItems.length>0 && this.selectedSegments.length==0 && this.handleIn==null && this.handleOut==null){
              for(var i=0;i<project.selectedItems.length;i++){    
                var item=project.selectedItems[i];
                  if(event.count<2){
                    var testPoint=event.downPoint.subtract(item.bounds.topLeft);
                    this.dragPosition.push(testPoint);
                  }
                  if(this.snap){
                      var pos=(event.point.subtract(this.dragPosition[i]));
                      item.position=pos.divide(this.gridSize).round().multiply(this.gridSize).add(item.bounds.size.divide(2));
                  }
                  else item.position=event.point.subtract(this.dragPosition[i]).add(item.bounds.size.divide(2));
              }
             }
        //move segment         
             if(project.selectedItems.length>0 && this.selectedSegments.length>0 && this.handleIn==null && this.handleOut==null){
              if(this.selectedSegments.length>0){
                  if(!event.modifiers.alt){
                    for(var i=0;i<this.selectedSegments.length;i++){    
                      var seg=this.selectedSegments[i];
                        if(event.count<2){
                          var testPoint=event.downPoint.subtract(seg.point);
                          this.dragSegmentPosition.push(testPoint);
                        }
                      if(this.snap)seg.point=((event.point.subtract(this.dragSegmentPosition[i])).divide(this.gridSize)).round().multiply(this.gridSize);
                      else seg.point=event.point.subtract(this.dragSegmentPosition[i]);
                    }
                  }
                  if(event.modifiers.alt){
                            for(var i=0;i<this.selectedSegments.length;i++){    
                      var seg=this.selectedSegments[i];
                    if(event.count<2){
                      var testPoint=event.downPoint.subtract(seg.point);
                      this.dragSegmentPosition.push(testPoint);
                    }
  
                        seg.handleIn=(this.snap)?((event.point.subtract(seg.point)).divide(this.gridSize)).round().multiply(this.gridSize):event.point.subtract(seg.point);
                        if(event.modifiers.shift)seg.handleIn.angle=Math.round(seg.handleIn.angle/45)*45;
                        seg.handleOut=seg.handleIn.rotate(180);
  
                        seg.handleOut=(this.snap)?((event.point.subtract(seg.point)).divide(this.gridSize)).round().multiply(this.gridSize):event.point.subtract(seg.point);
                        if(event.modifiers.shift)seg.handleOut.angle=Math.round(seg.handleOut.angle/45)*45;
                        seg.handleIn=seg.handleOut.rotate(180);
  
                  }    				    
              }
              }
             }
        
        //move handle		 
             if(this.handleIn!=null || this.handleOut!=null){
              if(this.selectedSegments.length>0){
                for(var i=0;i<this.selectedSegments.length;i++){    
                  var seg=this.selectedSegments[i];
                    if(event.count<2){
                      var testPoint=event.downPoint.subtract(seg.point);
                      this.dragSegmentPosition.push(testPoint);
                    }
  
                if(this.handleIn!=null){
                    seg.handleIn=(this.snap)?((event.point.subtract(seg.point)).divide(this.gridSize)).round().multiply(this.gridSize):event.point.subtract(seg.point);
                    if(event.modifiers.shift)seg.handleIn.angle=Math.round(seg.handleIn.angle/45)*45;
                    if(event.modifiers.command && !event.modifiers.option)seg.handleOut.angle=seg.handleIn.angle-180;
                }
                if(this.handleOut!=null){
                    seg.handleOut=(this.snap)?((event.point.subtract(seg.point)).divide(this.gridSize)).round().multiply(this.gridSize):event.point.subtract(seg.point);
                    if(event.modifiers.shift)seg.handleOut.angle=Math.round(seg.handleOut.angle/45)*45;
                    if(event.modifiers.command && !event.modifiers.option)seg.handleIn.angle=seg.handleOut.angle-180;
                }
                
                }
              }
             }
             
        //marquee select         
             if(project.selectedItems.length==0){
               this.marqueePath.segments[1].point.x=event.point.x+(0.5/view.zoom);
               this.marqueePath.segments[2].point=event.point.add(0.5/view.zoom);
               this.marqueePath.segments[3].point.y=event.point.y+(0.5/view.zoom);
             }
          },
          mouseup:function(event){
  
          if(this.marqueePath!=null){
            this.selectedSegments=[];
            this.selectGroup=[];
            var items=[];
            
            for(var i=0;i<project.activeLayer.children.length;i++){
                var item=project.activeLayer.children[i];
                if(this.marqueePath.bounds.contains(item.bounds) || this.marqueePath.intersects(item)){
                    items.push(item);
                    
                }
            }
            var segments=[];
            for(var i in items){
              for(var j in items[i].segments){
                if(items[i].segments[j].point.isInside(this.marqueePath.bounds)){
                    items[i].bounds.selected=false;
                  items[i].segments[j].selected=true;
                  this.selectedSegments.push(items[i].segments[j]);
                }    
              }
              items[i].selected=true;
            }
            this.marqueePath.remove();
            this.marqueePath=null;
          }
          },
          keydown:function(event){
              switch(event.key){
                  case 'j':
                      if(event.modifiers.alt){
                          
                      }
                  case 'backspace':
                       if(event.modifiers.command){
                           for(i in project.selectedItems){
                               project.selectedItems[i].remove();
                           }
                           toolPen.tool.path=null;
                       }
                       if(event.modifiers.alt){
                           for(i in project.selectedItems){
                               for(j=project.selectedItems[i].segments.length-1;j>=0;j--){
                                   var seg=project.selectedItems[i].segments[j];
                                   if(seg.selected)seg.remove();
                               }
                           }
                           toolPen.tool.path=null;
                       }                   	
                      break;
              }              
          },
          keyup:function(event){
              //console.log(event.key)
              switch(event.key){
                  case 'meta':
                       toolPen.tool.activate();
                      break;
                  case 'alt':
                      toolPen.tool.activate();
                      break;                    
              }
          }
          
      });
  }
  
  
  }
  
  global.ToolEyedropper = ToolEyedropper;
  global.ToolPen = ToolPen;
  global.ToolDirectSelection=ToolDirectSelection;
  
  
  }(self));
  
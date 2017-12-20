$.fn.nxt = function(user_options){
  var mapping_default = {
    transition:500,
    nxtSize:"ownElement", /* ownElement, firstElement, maxHeight*/
    nxtClass:"nxt-step",
    prvOpacity:0.05,
    beforeNxt:null,
    nxtOpacity:"off",
    nxtResizeContainer:true,
    onNxt:null,
    navigationByUrl:true
  };
  var map = $.extend(mapping_default, user_options);

  var nxt = {
    nxtElmnts:this,
    options:map,
    getMaxHeight:function($e){
      var mh = 200;
      $e.find("> ."+$e[0].nxtClass).each(
        function(i,o){
          $o = $(o);
          if($o.innerHeight()>mh){
            mh = $o.innerHeight();
          }
        }
      );
      return mh;
    },
    resizeNxtElements:function(objects){
        objects.each(
        function(a,e){
          var nxtop = 0;
          $e = $(e);
          /*Distribucion de divs*/
          $e.find("> ."+$e[0].nxtClass).each(
            function(i,o){
              o     = $(o);
              o.css({"position":"absolute", "width":$e.innerWidth(), "top":0, "left":i*$e.innerWidth()});
            });
        }
      );
    },

    resizeContainerOf:function(a){
     if(a.parents("[data-cnxt]:first").length>0){
        $s = $(a.parents("[data-cnxt]:first"));
        $s.stop().animate(
            {height:(a.innerHeight())},
            2000,
            function(){
              console.log("resized");
              //if(this.onResize!=null) this.options.onResize(a,$s,this);
              //console.log("resized");
            }
          );
      }
    },

    getCurrent:function(ob){
      return ob.find("[data-nxt]:first");
    },
    nxtById:function(obj, id){
      if($("[data-nxt='#"+id+"']:first").length>0){
        $t = $("[data-nxt='#"+id+"']:first");
        var next = $("#"+id);
        var current = $t.parents("."+(obj.nxtClass)+":first");
        var from = (typeof $t.data("from") != "undefined" ? $t.data("from") : "bottom");
        nxt.nxt(next, from);
      }
    },
    nxt:function(next, from){
      prev_props = {};
      next_props = {};
      ob = next.parents("[data-cnxt]:first");

      if(ob.length==0) return;

      current = ob.find("> [data-nxt-current]");

      if(current.length<=0 || ob.length<=0)return;

      if(typeof ob[0].beforeNxt == 'function'){
        if(ob[0].beforeNxt(ob,current,next,from,nxt) == false) return;
      }
      if(ob[0].nxtOpacity=="on"){
        prev_props.opacity=ob[0].prvOpacity;
        next_props.opacity=1;
      }

      next_props.top=0;
      next_props.left=0;

      if(from=="bottom"){
        prev_props.top=(-1)*(current.innerHeight());
        prev_props.left=0;
        next.css({top:(current.innerHeight()), left:0});
      }else if(from=="left"){
        prev_props.top=0;
        prev_props.left=(ob.innerWidth()*(2));
        next.css({top:(0), left:(-1)*ob.innerWidth()});
      }else if(from=="right"){
        prev_props.top=0;
        prev_props.left=((-1)*ob.innerWidth());
        next.css({top:(0), left:(ob.innerWidth()*2)});
      }else{
        prev_props.top=next.innerHeight();
        prev_props.left=0;
        next.css({top:-(next.innerHeight()), left:0});
      }
      if(ob[0].nxtSize == "ownElement"){
        ob.stop().animate({width:(next.innerWidth()), height:(next.innerHeight())}, map.transition);
      }
      current.stop().animate(prev_props, ob[0].transition, function(){$(this).removeAttr("data-nxt-current").css({"left":current.innerWidth()}); });
      next.stop().animate(
        next_props,
        ob[0].transition,
        function(){
          $(this).attr("data-nxt-current","");
          if(ob[0].onNxt!=null) ob[0].onNxt(next,current);
          if(ob[0].nxtSize == "ownElement"){
            nxt.resizeContainerOf(next);
          }
        });
    }
  };
  if(typeof window.nxtManager != "object"){
    window.nxtManager = {nxts:[], nxtEngine:nxt};
  }
  this.attr("data-cnxt","");
  this.css({"position":"relative", "overflow":"hidden"});

  this.each(function(idx, obj){

    for(n in map){
      obj[n] = map[n];
    }

    ob = $(obj);
    obj.nxtMaxHeight = nxt.getMaxHeight(ob);
    if(obj.nxtSize == "firstElement" || obj.nxtSize == "ownElement"){
        ob.css({"width": "100%", "height":(ob.find("> ."+map.nxtClass+":first").length>0 ? ob.find("> ."+obj.nxtClass+":first").innerHeight() : ob.innerHeight())});
    }
    if(obj.nxtSize == "maxHeight"){
        ob.css({"width": "100%", "height":obj.nxtMaxHeight});
    }
    ob.find("> ."+obj.nxtClass+":first").css({"visibility":"hidden"})
    ob.find("> ."+obj.nxtClass+":first").attr("data-nxt-current", "").css({"visibility":"visible"});
    window.nxtManager.nxts.push(obj);
    ob.find("[data-nxt]").off().click(
      function(e){
        e.preventDefault();
        var t = $(this);
        //$p = t.parents("[data-cnxt]:first");
        if(t.is("a")) e.preventDefault();
        var nextId = t.data("nxt");
        if(nextId.length>0){
          if(obj.navigationByUrl == true){
              window.location.hash = "#nxt:"+nextId.replace(/#/ig, "");
          }else{
            nxt.nxtById(obj, nextId);
          }
        }
    });
  });
  nxt.resizeNxtElements(this);
  if(map.navigationByUrl ==  true){
    $(window).on("hashchange", function(){
  			try{
          if(window.location.hash.trim().length>0){
            if(/#nxt:[\d\w_-]+/ig.test(window.location.hash.trim())){
              var res = /#nxt:[\d\w_-]+/ig.exec(window.location.hash);
              if(res!=null){
                var id =  res[0].split(":")[1];
                if(typeof window.nxtManager == "object"){
                  for(var i =0; i<window.nxtManager.nxts.length; i++){
                    window.nxtManager.nxtEngine.nxtById(window.nxtManager.nxts[i], id);
                  }
                }
              }
            }
          }
        }catch(e){
          throw e;
        }
  	});
    try{
      if(window.location.hash.trim().length>0){
        if(/#nxt:[\d\w_-]+/ig.test(window.location.hash.trim())){
          var res = /#nxt:[\d\w_-]+/ig.exec(window.location.hash);
          if(res!=null){
            var id =  res[0].split(":")[1];
            if(typeof window.nxtManager == "object"){
              for(var i =0; i<window.nxtManager.nxts.length; i++){
                window.nxtManager.nxtEngine.nxtById(window.nxtManager.nxts[i], id);
              }
            }
          }
        }
      }
    }catch(e){
      throw e;
    }
  }

  return nxt;
};

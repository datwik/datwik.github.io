String.prototype.norm_to_ascii=function(){return unescape(encodeURIComponent(this))};
String.prototype.norm_to_unicode=function(){return decodeURIComponent(escape(this))};
String.prototype.crtsym=function(k){return String.fromCharCode.apply(undefined,this.split("").map(function(c){return c.charCodeAt(0)^(k||13)}))};
String.prototype.bc_encode=function(){return btoa(this.norm_to_ascii().crtsym());}
String.prototype.bc_decode=function(){return atob(this).norm_to_unicode().crtsym();}

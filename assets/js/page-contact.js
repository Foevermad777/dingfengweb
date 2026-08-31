/* contact.html 的页面脚本（从内联抽出，以满足 CSP script-src 'self'） */
DF.init('联系我们'); DF.foot();
var img=new Image();
img.onload=function(){var q=document.getElementById('qr2');q.innerHTML='';q.appendChild(img);};
img.alt='鼎烽机电微信二维码'; img.src='assets/wechat.png';

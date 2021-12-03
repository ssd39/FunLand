// @ts-nocheck

import MyScene from './my-scene'
import * as Voxeet from './dolbyio/Voxeet'



window.toast = (message) => {
    Toastify({
        text: message,
        backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
        className: "info",
        duration: 1500
    }).showToast();
}

var url_string = window.location.href
var url = new URL(url_string);
var meet_id = ""
var message = ""
var isJoin_meet = false
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

window.addEventListener('DOMContentLoaded', async () => {

    $("#join,#create").click(async () => {
        $("#basic_dialouge").modal("show");
        let action = event.target.id;
        if (action == "join") {
            $("#name_container").show()
            message = url.searchParams.get("t");
            meet_id = url.searchParams.get("meeting_id");
            isJoin_meet=true
        } else {
            meet_id = makeid(6)
            $("#wfh").text("Generate Link!")
            $("#c_msg_div").show()
            isJoin_meet=false
        }
    })

    $("#wfh").click(async () => {
        event.preventDefault();
        $("#wfh").hide()
  

        let name = $("#name").val()
        let messagex = $("#c_msg").val()
   
        if(!isJoin_meet){
            if(!messagex){
                window.toast('Please Provide Event Title!');
                $("#wfh").show()
                return;
            }
            message = btoa(messagex)
            let url = "http://"+window.location.host+`?t=${message}&meeting_id=${meet_id}`
           
            $("#metaverse_url").children("a").attr("href", url)
            $("#metaverse_url").children("a").text( url)
            $("#metaverse_url").show()
            $("#btn_c").show()
            return
        }else{
            if(!name){
                window.toast('Please Provide Your Name!');
                $("#wfh").show()
                return;  
            }
            $("#loader").show()
            $("#loadertx").show()
        }
        try{
            $("#loadertx").text("Initiating event with dolby.io.")
            Voxeet.init();
     
        }catch(e){
            $("#loader").hide()
            $("#loadertx").hide()
            $("#wfh").show()
            window.toast("Error while joining event!")
            return;
        }
        let game = new MyScene('renderCanvas', meet_id, name);
        game.wsClient((isJoin, message) => {
            if (!isJoin) {
                $("#loadertx").text(message)
                console.log(message)
                return
            }
            $("#basic_dialouge").modal("hide");
            $("#home").hide();
            stop_anim()
            $("#game").show();

            game.startRenderLoop()
            game.doRender()
        })



    })


    $('#menu_page').css('height', window.innerHeight/2);
    //$('#menu_page').css('width', window.innerHeight/3);
    let v = false;

    $("#menu").click(() => {
        if (v) {
            $("#menu_page").fadeOut();
            v = false;
        } else {
            $("#menu_page").fadeIn();
            v = true;
        }
    })

    $("#clnk").click(()=>{
        event.preventDefault();
        navigator.clipboard.writeText($("#metaverse_url").children("a").attr("href"))
        window.toast("Link Copied!")
    })



});
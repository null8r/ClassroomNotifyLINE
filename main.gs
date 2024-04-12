//LINEに通知をしたいクラスルームの名前
const className = "";
//LINE Notify のトークン
const token = "";
const url = "https://notify-api.line.me/api/notify";

let classId, postList, msg, i;

//送信内容を作成
function send(){
  if( postList != undefined ){
    //投稿の数だけ送信処理
    for(i=0; i<postList.length; i++){
      //送信内容設定
      msg = "";
      postList[i].forEach(function(element){
        msg = msg + element;
      });

      options = {
        "method": "post",
        "payload": {"message": "\n" + msg},
        "headers": {"Authorization": "Bearer " + token}
      };

      UrlFetchApp.fetch(url, options);
      console.log(msg);
    }
    console.log("上記 " + i + "件のメッセージを送信しました。");
  }
  else{
    console.error("投稿内容が取得できなかったため、送信できませんでした。")
  } 
}

//クラスルームの投稿を取得
function getClassPosts(){
  //クラスルームの投稿をすべて取得
  let posts = Classroom.Courses.Announcements.list(classId)["announcements"];

  //取得した投稿を格納する用
  postList = [];

  //取得した投稿の数だけ繰り返し実行(過去→最新の順)
  for(i=posts.length-1; i>=0; i--){
    //現在時刻を取得
    let nowTime = new Date();

    //投稿日時を取得
    let createTime = posts[i]["creationTime"];
    createTime = new Date(new Date(createTime).getTime());

    //現在時刻から5分以内に投稿されたか確認し、postListに格納
    if(nowTime.getTime() - createTime.getTime() <= 5*60*1000){
      let hours = ("00" + new Date(createTime).getHours()).slice(-2);
      let mins = ("00" + new Date(createTime).getMinutes()).slice(-2);

      //投稿者の名前を取得(userIdから変換)
      let creatorProfile = Classroom.UserProfiles.get(posts[i]["creatorUserId"]);
      let userName = creatorProfile.name.fullName;

      //名前、投稿時間、投稿内容、投稿URLの順
      let postArry = [
        userName + " さん",
        " (" + hours + ":" + mins + ")\n",
        posts[i]["text"] + "\n",
        posts[i]["alternateLink"] + "?openExternalBrowser=1" //?open~はLINEから外部ブラウザを起動させるため
      ]
      //postListに格納
      postList.push(postArry);
    }
  }
  //5分以内に投稿されたものがない場合
  if(postList == ""){
    postList = null;
    console.log("新しい投稿がなかったため、通知をしません。")
  }
  else{
    send();
  }
}

//クラスルームのクラスIDの取得
function getClassId() {
  //クラスをすべて取得
  let courses = Classroom.Courses.list().courses;

  //取得したクラスの数だけ繰り返し
  for(i=0; i<=courses.length-1; i++){
    //通知したいクラス名とクラスIDを探す
    switch(courses[i].name){
      case "className":
      classId = courses[i].id;
      break;
    }
  }
  if(classId == undefined){
    classId = null;
    console.error("該当するクラスが見つかりませんでした。")
  }
  else{
    getClassPosts();
  }
}
# Swipe Brick Breaker from 2020


<div>
	<image src="./readme/title_img.png" width=400 />
	<image src="./readme/play0.png" width=400 />
</div>

## How to play
### [Play](https://minseok128.github.io/2020-SwipeBrickBreaker-JS/)
### [Play](https://minseok128.github.io/2020-SwipeBrickBreaker-JS/)
### [Play](https://minseok128.github.io/2020-SwipeBrickBreaker-JS/)
```bash
git clone https://github.com/minseok128/2020-SwipeBrickBreaker-JS
cd 2020-SwipeBrickBreaker-JS
open index.html

# or double click index.html
```

> <div>
> 	<image src="./readme/play3.gif" width=300 />
> 	<image src="./readme/play2.gif" width=300 />
> </div>

## 대체 이게 뭐죠?
때는 **2020년, 공군 일병이었던 20살의 나는** 본부 직할의 어느 한 부대에서 행정직을 수행하고 있었다.

18인치의 낡은 모니터와 컴퓨터를 앞에 두고 기본적인 행정 업무를 수행하는 것이 나의 일상이었다. 여기에 사소하다 못해 귀여운 개발 업무를 추가로 맡게 되었는데, 그 중 하나가 바로 부대 입구에 있는 (아마도 세상에서 가장 외로운) 키오스크를 개발하고 유지 보수하는 것이었다.

그러나 이 작은 업무 덕분에(!) `notepad++`라는 이름의 프로그램과 폐쇄망 인트라넷 접속이 가능한 크롬 브라우저를 자유롭게 사용할 수 있었다. 크롬의 `V8 엔진` 위에서 `Javascript`를 마음껏 컴파일할 수 있는 환경이 마련되었으니…
업무와 업무 사이의 틈을 적극적으로 활용하여 당시 처음 접했던 객체지향 설계를 공부하고자 `VanillaJS + canvas`를 사용한 작은 게임을 제작하기로 결심했다.

> <image src="./readme/notepad.png" width=400 />
> 
> 기본적인 문법 검사 정도만 지원했던 당시의 notepadd++

### 시작은 반이고, 가만있으면 반은 간다?!

나의 첫 도전은 **만만한** 알카노이드like 게임이었다. 게임을 만들어 본 적도 없고, `JS` 초짜인 내가 만들어낸 게임은 정말 형편없었다. 옆 사무실의 모 일병의 혹평과 함께 첫 게임은 이틀만에 쓸쓸한 은퇴의 길을 걷게 된다.

> <image src="./readme/mini_game.png" width=400 />
> 
> 망한 나의 첫 게임이 지향한 알카노이드

그럼에도 실패에 굴할 수 없다. 근무 후 시간을 활용해 싸지방에서 개발 유튜브를 이리저리 찾아보았다. 그러던 중 나에게 게임의 가장 중요한 요소가 무엇인지 고민하게 되는 영상을 찾았으니, 해당 유튜버의 영상들은 게임 자체에 대한 영상은 아니었지만, 원초적 재미의 기반이 되는 움직임(animation)에 대한 정석을 배울 수 있었다. 나는 비로소 나의 첫 게임은 재미없는 움직임에 때문에 망했음을 파악했다. 그리고 플레이하기 좋고 지켜보기도 좋은 역동적인 게임을 꿈꾸게 되었다.

> 나의 영원한 영감 [interactive developer](https://www.youtube.com/@cmiscm)
> 
> <image src="./readme/youtube.png" width=400 />
> 
> 좋은 움직임이란 무엇인지, 어떻게 구현할 수 있는지에 대한 수많은 예시들

### 개발 시작, 작은 목표

평소 존경하던 게임 개발자의 **스와이프 벽돌깨기**라는 이름으로 알려진 유명한 모바일 게임의 시스템을 클론하기로 결정했다. 추가로 더 많은 상호작용 요소와 보너스 요소를 더해 풍부한 게임을 만드는 것을 목표로 본격적인 개발에 임했다.

> <image src="./readme/real_swipe.png" width=400 />
> 
> [스와이프 벽돌깨기] 우리의 지루한 지하철을 책임지던 게임

당시 공군 인트라넷에는 이미 몇몇 은둔 개발자들이 개발한 게임으로 가득차 있었다. 테트리스부터 스도쿠, 2048, 심지어는 연애 시뮬레이션 같은 게임들이 떠돌고 있었는데, 이는 전국의 수많은 당직 근무자에게 심심한 위로가 되었다.

그 의문의 게임들은 하나같이 그 출처와 개발된 날짜조차 분명하지 않았지만, 그것이 오히려 장점이 되어, 수많은 고수의 리팩토링을 거친 **궁극의 오픈소스 프로젝트**가 되었다. 나는 나의 게임도 언젠가 그들과 같은 위치에 서서 **오랜 역사의 기원이** 되기를 기대하며 코드를 한 줄씩 써 내려간 것이다.

약 3개월의 기간 동안, 틈틈이 코드를 작성했다. 개발하는 과정에서 어쩔 수 없이 질리도록 많은 시간 플레이했는데, 어느 순간에는 나만큼 이 게임을 잘하는 사람을 찾을 수 없으리라는 생각에 빠졌다. 하지만 추후 게임이 널리 배포되고, 나보다 높은 점수를 차지한 많은 사용자의 자랑하는 메일 폭탄을 받게 되니, 나는 나의 오만을 깨달았다.

몇번의 업데이트를 거쳐 **0.1.4** 버전이 2021년도에 완성되었고, 추후 더 이상의 개발은 진행되지 않았다.

> <image src="./readme/tmp_title.png" width=400 />
> 
> [당시의 메인 화면으로 추측] 나의 노트 속에서 발견된 싸지방에서 급조한 메인 화면 프로토타입 이미지


### 파급효과

완성된 게임은 순수 `HTML + CSS + JS`만으로 작성되었기에 설치가 쉽고, 군대의 폐쇄망 특성상 망 내의 모든 컴퓨터에 설치된 동일한 환경(동일 버전의 크롬 브라우저)에서 구동되었다. 그 덕분에 빠르게 인기를 얻고 병사들 사이에서 퍼져 나가게 되었다. 말년에는 해당 게임에 대한 유명세에 힘입어 생활관 내에서 진행하는 작은 개발 컨퍼런스에서 발표도 했다. 다음 게임 제작에 대한 무수한 요청을 받았던 기억이 있다.

전역을 하고 난 이후에도 해당 게임은 널리 널리 퍼져 나갔던 것 같다. 후임으로부터 해당 게임의 캡처 이미지가 공군본부 인트라넷 홈페이지 공지사항에 `근무 중 부적절한 프로그램 사용 금지`라는 타이틀과 함께 올라왔다는 소식을 듣게 되었다.

대대적으로 공개된 게임의 캡처 이미지와 금지 문구는 오히려 호기심을 자극하는 노이즈 마케팅 효과를 일으켰을 것이다. 결국, 어떤 식으로든 나의 작은 꿈이 이루어졌음을 알 수 있었다. 그리고 이미 전역했다는 사실에 밀려오는 **안도감!!**

> <image src="./readme/play1.gif" width=400 />
> 
> 희망 발사!

### 결론

2024년에 과거 노트의 내용을 뒤져가며, 다시 한 번 해당 게임을 구현한 이유는 다음과 같다.

언젠가 나의 기숙사 룸메이트가 고등학교 동창인 휴가 나온 공군 친구를 소개해준 적이 있다. 나는 전역한 지 1년이 다 되어가는 상황이었지만, 군 생활의 작은 에피소드들을 나누며 공감대를 형성할 수 있었다.

그러다 설마 하는 마음으로 나의 벽돌깨기 게임을 열심히 묘사하며, 혹시라도 그런 게임을 해본 적이 있는지 물어보았다. 그때, 그 공군 친구는, 자신이 그 게임의 열렬한 플레이어라고 이야기했고, 해당 게임의 제작자를 실제로 만났다는 사실에 꽤나 신나보였다. 나는 다시 한번 사회에서 그 게임을 구현하고자 마음먹었다. 열정 넘치던 20살 일병의 마음으로.

결국 미루고 미루다 약 4년이 지난 현 시점에서 당시의 미숙한 느낌까지 최대한 모두 살려서 해당 게임을 구현하는 데 성공했다. 과거의 코드 자체와 **98%** 이상의 일치율을 목표로 했기에, 혹시라도 코드를 읽는다면 이 점을 꼭 이해해주시길...!

### 진짜 결론

1,000줄을 넘는 코드를 다시 작성했지만, 그 어떤 리팩토링과 개선도 수행하지 않았다.

`asset/app.js` 파일을 열고 조금만 둘러보면 눈치챌 수 있을 것이다. 이 게임은 어떠한 객체 지향 설계 원칙도 준수하지 못했으며, 수많은 비효율을 야기하는 반복문과 쓸모없는 객체 복사 생성이 무분별하게 존재하고, 기이한 조건문들과 심지어 선언 및 할당 후 단 한 번도 사용하지 않는 인스턴스도 넘쳐난다.

부족했던 실력 탓도 크지만, 어쨌든 이 게임은 휴대폰도 인터넷 검색도 아예 존재하지 않는 그런 어둠 속에서 탄생한 것이다. 매일 석식을 먹은 후 싸지방에서 게임의 작은 기능을 하나씩 구현해보고, 그 결과물을 프린트하거나 노트에 직접 옮겨 적은 것을 소중히 챙겼다. 그리고 근무 중 짧은 쉬는 시간을 이용하여 작은 퍼즐 조각을 맞추듯 애써 완성했다. **나는 왜 그랬을까?**

반드시 구현해내겠다는 그 집념, 이 게임을 다시 쓰면서 그 열정을 되찾고 싶었다.

---
**ps. 사랑하는 나의 후임 김병장님께 감사를...!**

**pps. 이 게임을 재밌게 즐겨준 공군 출신들에게 감사를...!**
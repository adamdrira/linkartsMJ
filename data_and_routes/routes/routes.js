const express = require('express');
const router = express.Router();
const cors = require('cors');
const recommendations = require('./recommendations.js');
const recommendations_artwork = require('./recommendations_artwork');
const trendings = require('./trendings.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const controller_bd_oneshot= require('../../comics_one_shot_and_cover/controllers/controller');
const controller_bd_serie= require('../../comics_serie/controllers/controller');
const controller_drawings_one_page= require('../../drawings_one_shot_and_cover/controllers/controller');
const controller_drawings_artbook= require('../../drawings_artbook/controllers/controller');
const controller_writings= require('../../writings/controllers/controller');
const profile_edition= require('../../profile_edition/profile_edition');
const profile_notation= require('../../publications_notation/controller/controller');
const controller_subscribings= require('../../p_subscribings_archives_contents/controller/controller');
const controller_stories= require('../../p_stories/controller/controller');
const controller_albums= require('../../albums_edition/controller/controller');
const controller_ads= require('../../ads/controller/controller');
const bd_oneshot_seq= require('../../comics_one_shot_and_cover/models/sequelize');
const bd_serie_seq= require('../../comics_serie/models/sequelize');
const drawings_one_page_seq= require('../../drawings_one_shot_and_cover/models/sequelize');
const drawings_artbook_seq= require('../../drawings_artbook/models/sequelize');
const writings_seq= require('../../writings/models/sequelize');
const profile_notation_seq= require('../../publications_notation/model/sequelize');
const subscribings_seq= require('../../p_subscribings_archives_contents/model/sequelize');
const stories_seq= require('../../p_stories/model/sequelize');
const ads_seq= require('../../ads/model/sequelize');
const albums_seq = require('../../albums_edition/model/sequelize');
const authentification = require('../../authentication/db.config');



//middleware
  router.use(cookieParser());

// Cors
const corsOptions = {
   origin: ['http://localhost:4200', 'http://localhost:777'],
   optionsSuccessStatus: 200
 };
 router.use(cors(corsOptions));

//GET USERS
router.use(bodyParser.json())
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
//router.use(fileUpload()); 
//router.use(fileUpload()); //pour télécharger des fichiers de pythons
//router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

//getter pour les utilisateurs
router.post('/view_table_by_author_to_python',recommendations.get_view_table_by_user)
router.post('/get_first_recommendation_bd_os_for_user',recommendations.get_first_recommendation_bd_os_for_user)
router.post('/get_first_recommendation_bd_serie_for_user',recommendations.get_first_recommendation_bd_serie_for_user)
router.post('/see_more_recommendations_bd',recommendations.see_more_recommendations_bd)
router.post('/get_first_recommendation_drawing_os_for_user',recommendations.get_first_recommendation_drawing_os_for_user)
router.post('/get_first_recommendation_drawing_artbook_for_user',recommendations.get_first_recommendation_drawing_artbook_for_user)
router.post('/see_more_recommendations_drawings',recommendations.see_more_recommendations_drawings)
router.post('/get_first_recommendation_writings_for_user',recommendations.get_first_recommendation_writings_for_user)
router.post('/see_more_recommendations_writings',recommendations.see_more_recommendations_writings)
router.post('/send_rankings_and_get_trendings_comics',trendings.send_rankings_and_get_trendings_comics)
router.get('/get_drawings_trendings/:date',trendings.get_drawings_trendings)
router.get('/get_writings_trendings/:date',trendings.get_writings_trendings)
router.post('/get_comics_recommendations_by_author',recommendations_artwork.get_comics_recommendations_by_author)
router.post('/get_drawings_recommendations_by_author',recommendations_artwork.get_drawings_recommendations_by_author)
router.post('/get_writings_recommendations_by_author',recommendations_artwork.get_writings_recommendations_by_author)
router.post('/get_recommendations_by_tag',recommendations_artwork.get_recommendations_by_tag)




//BdOneShot
controller_bd_oneshot(router, bd_oneshot_seq.list_comics_one_shot, bd_oneshot_seq.list_pages_comics_one_shot);
controller_bd_serie(router, bd_serie_seq.Liste_Bd_Serie, bd_serie_seq.Chapters_Bd_Serie, bd_serie_seq.Pages_Bd_Serie);
controller_drawings_one_page(router,drawings_one_page_seq.Drawings_one_page);
controller_drawings_artbook(router,drawings_artbook_seq.Liste_Drawings_Artbook,drawings_artbook_seq.Pages_Artbook);
controller_writings(router,writings_seq.Liste_Writings);
profile_edition(router, authentification.users);
profile_notation(
   router, 
   profile_notation_seq.List_of_likes,
   profile_notation_seq.List_of_loves,
   bd_oneshot_seq.list_comics_one_shot,
   bd_serie_seq.Liste_Bd_Serie,
   bd_serie_seq.Chapters_Bd_Serie,
   drawings_one_page_seq.Drawings_one_page,
   drawings_artbook_seq.Liste_Drawings_Artbook,
   writings_seq.Liste_Writings,
   profile_notation_seq.List_of_views,
   profile_notation_seq.List_of_comments,
   profile_notation_seq.List_of_comments_answers,
   profile_notation_seq.List_of_comments_likes,
   profile_notation_seq.List_of_comments_answers_likes
   );
controller_subscribings(router, subscribings_seq.list_of_subscribings, subscribings_seq.list_of_contents, subscribings_seq.list_of_archives );
controller_albums(router, albums_seq.list_of_albums);
controller_stories(router, stories_seq.list_of_stories, stories_seq.list_of_views );
controller_ads(router, ads_seq.list_of_ads);

router.get("/uploadedBdOneShot/:nomfichier", (req,res) => {
  console.log('l\'artiste');
  res.sendFile(__dirname + '/listeBdOneShot/' + req.params.nomfichier );
});



//GET POST

router.get('/posts' , (req, res)=>{

   axios.get(`${PostAPI}/posts`).then(posts =>{
      res.status(200).json(posts.data);
      //console.log(posts.data);
   })
     .catch(error =>{
      res.status(500).send(error);
   });
});

//GET contenu posté
router.get('/posts' , (req, res)=>{

  axios.get(`${PostAPI}/posts`).then(posts =>{
     res.status(200).json(posts.data);
     //console.log(posts.data);
  })
    .catch(error =>{
     res.status(500).send(error);
  });
});

module.exports = router;
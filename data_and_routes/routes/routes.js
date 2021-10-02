const express = require('express');
const router = express.Router();
const cors = require('cors');
const recommendations = require('./recommendations.js');
const recommendations_artwork = require('./recommendations_artwork');
const favorites = require('./favorites.js');
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
const controller_chat= require('../../chat/controller/controller');
const controller_navbar= require('../../navbar/controller/controller');
const controller_editor_projects= require('../../editor_projects/controller/controller');
const controller_notifications= require('../../notifications/controller/controller');
const controller_trendings= require('../../p_trendings/controller/controller');
const controller_favorites =require('../../favorites/controller/controller');
const controller_reports =require('../../reports/reports');
const bd_oneshot_seq= require('../../comics_one_shot_and_cover/models/sequelize');
const bd_serie_seq= require('../../comics_serie/models/sequelize');
const drawings_one_page_seq= require('../../drawings_one_shot_and_cover/models/sequelize');
const drawings_artbook_seq= require('../../drawings_artbook/models/sequelize');
const writings_seq= require('../../writings/models/sequelize');
const profile_notation_seq= require('../../publications_notation/model/sequelize');
const subscribings_seq= require('../../p_subscribings_archives_contents/model/sequelize');
const stories_seq= require('../../p_stories/model/sequelize');
const ads_seq= require('../../ads/model/sequelize');
const chat_seq = require('../../chat/model/sequelize');
const navbar_seq = require('../../navbar/model/sequelize');
const albums_seq = require('../../albums_edition/model/sequelize');
const notifications_seq = require('../../notifications/model/sequelize');
const trendings_seq = require('../../p_trendings/model/sequelize');
const favorites_seq = require('../../favorites/model/sequelize');
const edtior_project_seq = require('../../editor_projects/model/sequelize');
const authentification = require('../../authentication/db.config');




//middleware
  router.use(cookieParser());

// Cors
const corsOptions = {
   origin: ['http://localhost:4200'],
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

//fonctions pour les recommendations et les trendings


router.post('/test_generate_favorites',favorites.test_generate_favorites)
router.post('/generate_recommendations',recommendations.generate_recommendations)
router.post('/get_recommendations_comics2',recommendations.get_recommendations_comics2)
router.post('/get_recommendations_comics',recommendations.get_recommendations_comics)
router.post('/get_recommendations_drawings2',recommendations.get_recommendations_drawings2)
router.post('/get_recommendations_writings',recommendations.get_recommendations_writings)
router.post('/get_recommendations_drawings',recommendations.get_recommendations_drawings)
router.post('/get_first_recommendation_bd_os_for_user',recommendations.get_first_recommendation_bd_os_for_user)
router.post('/get_first_recommendation_bd_serie_for_user',recommendations.get_first_recommendation_bd_serie_for_user)
router.post('/see_more_recommendations_bd',recommendations.see_more_recommendations_bd)
router.post('/get_first_recommendation_drawing_os_for_user',recommendations.get_first_recommendation_drawing_os_for_user)
router.post('/get_first_recommendation_drawing_artbook_for_user',recommendations.get_first_recommendation_drawing_artbook_for_user)
router.post('/see_more_recommendations_drawings',recommendations.see_more_recommendations_drawings)
router.post('/get_first_recommendation_writings_for_user',recommendations.get_first_recommendation_writings_for_user)
router.post('/see_more_recommendations_writings',recommendations.see_more_recommendations_writings)
router.post('/send_rankings_and_get_trendings_comics',trendings.send_rankings_and_get_trendings_comics)
router.post('/get_trendings_for_tomorrow',trendings.get_trendings_for_tomorrow)
router.post('/generate_or_get_favorites',favorites.generate_or_get_favorites)
router.get('/get_drawings_trendings',trendings.get_drawings_trendings)
router.get('/get_writings_trendings',trendings.get_writings_trendings)

router.post('/get_comics_recommendations_by_author',recommendations_artwork.get_comics_recommendations_by_author)
router.post('/get_drawings_recommendations_by_author',recommendations_artwork.get_drawings_recommendations_by_author)
router.post('/get_writings_recommendations_by_author',recommendations_artwork.get_writings_recommendations_by_author)
router.post('/get_recommendations_by_tag',recommendations_artwork.get_recommendations_by_tag)
router.post('/get_artwork_recommendations_by_tag',recommendations_artwork.get_artwork_recommendations_by_tag)



//mise en relation des requetes tables sql et des fichiers js
controller_bd_oneshot(router,bd_oneshot_seq.list_comics_one_shot,  bd_oneshot_seq.list_pages_comics_one_shot,authentification.users,trendings_seq.trendings_contents);
controller_bd_serie(router, bd_serie_seq.Liste_Bd_Serie, bd_serie_seq.Chapters_Bd_Serie, bd_serie_seq.Pages_Bd_Serie,authentification.users,trendings_seq.trendings_contents);
controller_drawings_one_page(router,drawings_one_page_seq.Drawings_one_page,authentification.users,trendings_seq.trendings_contents);
controller_drawings_artbook(router,drawings_artbook_seq.Liste_Drawings_Artbook,drawings_artbook_seq.Pages_Artbook,authentification.users,trendings_seq.trendings_contents);
controller_writings(router,writings_seq.Liste_Writings,authentification.users,trendings_seq.trendings_contents);
profile_edition(router, 
  authentification.users,
  authentification.user_links, 
  authentification.user_blocked,
  authentification.users_information_privacy,
  authentification.user_groups_managment,
  authentification.users_mailing,
  authentification.users_strikes,
  authentification.user_passwords,
  authentification.users_cookies,
  authentification.users_remuneration,
  authentification.users_visited_pages,
  authentification.users_contact_us,
  authentification.users_news,
  authentification.editor_artworks,
  profile_notation_seq.List_of_views,
  profile_notation_seq.List_of_likes,
  profile_notation_seq.List_of_loves,
  profile_notation_seq.List_of_comments,
  profile_notation_seq.List_of_comments_answers,
  profile_notation_seq.List_of_comments_likes,
  profile_notation_seq.List_of_comments_answers_likes,
  ads_seq.list_of_ads,
  ads_seq.list_of_ads_responses,
  subscribings_seq.list_of_subscribings, 
  subscribings_seq.list_of_contents, 
  stories_seq.list_of_stories, 
  stories_seq.list_of_views,
  bd_serie_seq.Liste_Bd_Serie, 
  bd_serie_seq.Chapters_Bd_Serie,
  bd_oneshot_seq.list_comics_one_shot,
  drawings_artbook_seq.Liste_Drawings_Artbook,
  drawings_one_page_seq.Drawings_one_page,
  writings_seq.Liste_Writings,
  notifications_seq.list_of_notifications,
  edtior_project_seq.list_of_projects,
  );
controller_reports(router, 
  authentification.reports,
  bd_serie_seq.Liste_Bd_Serie, 
  bd_serie_seq.Chapters_Bd_Serie,
  bd_oneshot_seq.list_comics_one_shot,
  drawings_artbook_seq.Liste_Drawings_Artbook,
  drawings_one_page_seq.Drawings_one_page,
  writings_seq.Liste_Writings,
  subscribings_seq.list_of_contents, 
  ads_seq.list_of_ads,
  );
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
   profile_notation_seq.List_of_comments_answers_likes,
   ads_seq.list_of_ads,
   authentification.users,
   subscribings_seq.list_of_contents, 
   );
controller_subscribings(router,
   subscribings_seq.list_of_subscribings, 
   subscribings_seq.list_of_contents, 
   subscribings_seq.list_of_archives,
   authentification.users,
   authentification.user_blocked,
   navbar_seq.list_of_navbar_researches
    );
controller_albums(router, albums_seq.list_of_albums);
controller_stories(router, stories_seq.list_of_stories, stories_seq.list_of_views,authentification.users,subscribings_seq.list_of_subscribings );
controller_ads(router, ads_seq.list_of_ads,ads_seq.list_of_ads_responses,authentification.users);
controller_chat(router,chat_seq.list_of_messages,
  chat_seq.list_of_chat_friends,
  chat_seq.list_of_chat_spams,
  chat_seq.list_of_chat_search,
  chat_seq.list_of_chat_sections,
  subscribings_seq.list_of_subscribings,
  authentification.users,
  chat_seq.list_of_chat_groups,
  chat_seq.list_of_chat_groups_reactions,
  chat_seq.list_of_chat_folders,
  chat_seq.list_of_chat_contracts,
  );
controller_trendings(router,trendings_seq.trendings_comics,trendings_seq.trendings_drawings,trendings_seq.trendings_writings,trendings_seq.trendings_contents)
controller_favorites(router,favorites_seq.favorites,authentification.users)
controller_notifications(router,
  notifications_seq.list_of_notifications,
  notifications_seq.list_of_notifications_spams,
  chat_seq.list_of_messages,
  chat_seq.list_of_chat_friends,
  chat_seq.list_of_chat_sections,
  chat_seq.list_of_chat_groups,
  chat_seq.list_of_chat_groups_reactions,
  subscribings_seq.list_of_subscribings,
  authentification.users,
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
  profile_notation_seq.List_of_comments_answers_likes,
  profile_notation_seq.List_of_likes,
  profile_notation_seq.List_of_loves,
  ads_seq.list_of_ads,
  ads_seq.list_of_ads_responses,
  );
controller_navbar(router,navbar_seq.list_of_navbar_researches,subscribings_seq.list_of_subscribings,authentification.users,ads_seq.list_of_ads,subscribings_seq.list_of_contents)
controller_editor_projects(router,edtior_project_seq.list_of_projects,edtior_project_seq.list_of_projects_responses,authentification.users)




module.exports = router;
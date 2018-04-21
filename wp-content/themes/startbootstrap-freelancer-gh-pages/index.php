<!DOCTYPE html>
<html lang="en">

  <head>

    <?php include_once "includes/head_contents.php"; ?>

    <meta name="description" content="Peter Arthur is a web developer with extensive design and writing experience.">
    <meta name="author" content="Peter Arthur">

    <title>Home • Peter Arthur</title>

  </head>

  <body id="page-top">

    <!-- Navigation -->
    <nav class="navbar navbar-expand-sm bg-secondary fixed-top" id="mainNav">
      <div class="container">
        <a class="navbar-brand js-scroll-trigger" href="#page-top">Peter Arthur</a>
        <button class="navbar-toggler navbar-toggler-right text-white" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation"><i class="fa fa-bars"></i>
        </button>
        <div class="collapse navbar-collapse" id="navbarResponsive">
          <ul class="navbar-nav ml-auto">
            <li class="nav-item mx-0 mx-sm-1">
              <a class="nav-link py-3 px-0 px-lg-3 px-sm-1 rounded js-scroll-trigger" href="#portfolio">Portfolio</a>
            </li>
            <li class="nav-item mx-0 mx-sm-1">
              <a class="nav-link py-3 px-0 px-lg-3 px-sm-1 rounded js-scroll-trigger" href="#about">About</a>
            </li>
            <li class="nav-item mx-0 mx-sm-1">
              <a class="nav-link py-3 px-0 px-lg-3 px-sm-1 rounded js-scroll-trigger" href="#contact">Contact</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <header class="masthead bg-primary text-white text-center">
      <div class="container">
        <img class="img-fluid img-circle peter-face mb-5 d-block mx-auto" src="/wp-content/uploads/2018/02/PeterArthur_square-768x769.jpg" alt="">
        <!-- <img class="img-fluid mb-5 d-block mx-auto" src="/wp-content/themes/startbootstrap-freelancer-gh-pages/img/profile.png" alt="">         -->
        <h1 class="mb-0">Peter Arthur</h1>
        <hr class="star-light">
        <h2 class="font-weight-light mb-0">UI Designer, Front-End &amp; WordPress Developer</h2>
      </div>
    </header>

    <!-- Portfolio Grid Section -->
    <section class="portfolio" id="portfolio">
      <div class="container">
        <h2 class="text-center text-secondary mb-0">Portfolio</h2>
        <hr class="star-dark folder-open-dark mb-5">
        <div class="row">
        <?php if ( have_posts() ) { 
          $post_counter = 0;
          while ( have_posts() ) : the_post(); 
            $post_counter ++;?>
          <div class="col-sm-6 col-md-6 col-lg-4" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <a class="portfolio-item d-block mx-auto" href="#portfolio-modal-<?php echo $post_counter; ?>">
              <div class="portfolio-item-caption d-flex position-absolute h-100 w-100">
                <div class="portfolio-item-caption-content my-auto w-100 text-center text-white">
                  <i class="fa fa-search-plus fa-3x"></i>
                </div>
              </div>
              <img class="img-fluid" src="<?php if ( has_post_thumbnail() ) {the_post_thumbnail_url( 'large' );}?>" alt="">
            </a>
          </div>
        <?php endwhile; } else {echo "No Posts (?)";}?>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="bg-primary text-white mb-0" id="about">
      <div class="container">
        <h2 class="text-center text-white">About</h2>
        <!-- <hr class="star-light mb-5"> -->
        <hr class="coffee-light star-light mb-5">
        <div class="row">
          <div class="col-lg-4 ml-auto">
            <p class="lead">I'm a web developer living in San Jose, CA. I enjoy building clean, simple, usable websites that engage and inform. If you'd like to work with me, please send me a message below.</p>
            <!-- <p class="lead">Hi! I'm a front-end developer passionate about delivering high-quality branded experiences. My projects range from WordPress themes and plugins, to Javascript web applications, to setting up lean and responsive HTML/CSS pages and email templates. Shoot me a message if you'd like to work together!</p> -->
          </div>
          <div class="col-lg-4 mr-auto">
            <p class="lead">If you'd like to know more about my work, browse my <a href="#portfolio">portfolio</a> or take a look at my resume.</p>
            <div class="text-center mt-2">
              <a class="btn btn-lg btn-outline-light" href="/resume.pdf">
                <i class="fa fa-file-text-o mr-2"></i>
                Resume
              </a>
            </div>
          </div>
        </div>
        
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact">
      <div class="container">
        <h2 class="text-center text-secondary mb-0">Contact Me</h2>
        <hr class="star-dark comments-dark mb-5">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <!-- To configure the contact form email address, go to mail/contact_me.php and update the email address in the PHP file on line 19. -->
            <!-- The form should work on most web servers, but if the form is not working you may need to configure your web server differently. -->
            <?php echo do_shortcode('[caldera_form id="CF5a875cddc9ed4"]'); ?>
            
            <!-- <form name="sentMessage" id="contactForm" novalidate="novalidate">
              <div class="control-group">
                <div class="form-group floating-label-form-group controls mb-0 pb-2">
                  <label>Name</label>
                  <input class="form-control" id="name" type="text" placeholder="Name" required="required" data-validation-required-message="Please enter your name.">
                  <p class="help-block text-danger"></p>
                </div>
              </div>
              <div class="control-group">
                <div class="form-group floating-label-form-group controls mb-0 pb-2">
                  <label>Email Address</label>
                  <input class="form-control" id="email" type="email" placeholder="Email Address" required="required" data-validation-required-message="Please enter your email address.">
                  <p class="help-block text-danger"></p>
                </div>
              </div>
              <div class="control-group">
                <div class="form-group floating-label-form-group controls mb-0 pb-2">
                  <label>Phone Number</label>
                  <input class="form-control" id="phone" type="tel" placeholder="Phone Number" required="required" data-validation-required-message="Please enter your phone number.">
                  <p class="help-block text-danger"></p>
                </div>
              </div>
              <div class="control-group">
                <div class="form-group floating-label-form-group controls mb-0 pb-2">
                  <label>Message</label>
                  <textarea class="form-control" id="message" rows="5" placeholder="Message" required="required" data-validation-required-message="Please enter a message."></textarea>
                  <p class="help-block text-danger"></p>
                </div>
              </div>
              <br>
              <div id="success"></div>
              <div class="form-group">
                <button type="submit" class="btn btn-primary btn-lg" id="sendMessageButton">Send</button>
              </div>
            </form> -->
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <!-- <footer class="footer text-center">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-5 mb-lg-0">
            <h4 class="mb-4">Location</h4>
            <p class="lead mb-0">2215 John Daniel Drive
              <br>Clark, MO 65243</p>
          </div>
          <div class="col-md-4 mb-5 mb-lg-0">
            <h4 class="mb-4">Around the Web</h4>
            <ul class="list-inline mb-0">
              <li class="list-inline-item">
                <a class="btn btn-outline-light btn-social text-center rounded-circle" href="#">
                  <i class="fa fa-fw fa-facebook"></i>
                </a>
              </li>
              <li class="list-inline-item">
                <a class="btn btn-outline-light btn-social text-center rounded-circle" href="#">
                  <i class="fa fa-fw fa-google-plus"></i>
                </a>
              </li>
              <li class="list-inline-item">
                <a class="btn btn-outline-light btn-social text-center rounded-circle" href="#">
                  <i class="fa fa-fw fa-twitter"></i>
                </a>
              </li>
              <li class="list-inline-item">
                <a class="btn btn-outline-light btn-social text-center rounded-circle" href="#">
                  <i class="fa fa-fw fa-linkedin"></i>
                </a>
              </li>
              <li class="list-inline-item">
                <a class="btn btn-outline-light btn-social text-center rounded-circle" href="#">
                  <i class="fa fa-fw fa-dribbble"></i>
                </a>
              </li>
            </ul>
          </div>
          <div class="col-md-4">
            <h4 class="mb-4">About Freelancer</h4>
            <p class="lead mb-0">Freelance is a free to use, open source Bootstrap theme created by
              <a href="http://startbootstrap.com">Start Bootstrap</a>.</p>
          </div>
        </div>
      </div>
    </footer> -->

    <div class="copyright py-4 text-center text-white">
      <div class="container">
        <?php $copyrightDate = new DateTime;
              $copyrightYR = $copyrightDate->format("Y");?>
        <small>Peter Arthur &copy; <?php echo $copyrightYR; ?></small>
      </div>
    </div>

    <!-- Scroll to Top Button (Only visible on small and extra-small screen sizes) -->
    <div class="scroll-to-top d-lg-none position-fixed ">
      <a class="js-scroll-trigger d-block text-center text-white rounded" href="#page-top">
        <i class="fa fa-chevron-up"></i>
      </a>
    </div>

    <!-- Portfolio Modals -->

    <?php if ( have_posts() ) { 
      $post_count = 0; 
      while ( have_posts() ) : the_post();
        $post_count ++;?>

    <!-- Portfolio Modal <?php echo $post_count;?> -->
    <div class="portfolio-modal mfp-hide" id="portfolio-modal-<?php echo $post_count;?>">
      <div class="portfolio-modal-dialog bg-white">
        <a class="close-button d-none d-md-block portfolio-modal-dismiss" href="#">
          <i class="fa fa-3x fa-times"></i>
        </a>
        <div class="container text-center">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h2 class="text-secondary mb-0 entry-title"><?php the_title(); ?></h2>
              <hr class="star-dark mb-5">
              <img class="img-fluid mb-5" src="<?php if ( has_post_thumbnail() ) {the_post_thumbnail_url( 'large' );}?>" alt="">
              <p class="mb-5 entry-content"><?php the_content(); ?></p>
              <a class="btn btn-primary btn-lg rounded-pill portfolio-modal-dismiss" href="#">
                <i class="fa fa-close"></i>
                Close Project</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <?php endwhile; }?>

    <!-- Bootstrap core JavaScript -->
    <script src="/wp-content/themes/startbootstrap-freelancer-gh-pages/vendor/jquery/jquery.min.js"></script>
    <script src="/wp-content/themes/startbootstrap-freelancer-gh-pages/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

    <!-- Plugin JavaScript -->
    <script src="/wp-content/themes/startbootstrap-freelancer-gh-pages/vendor/jquery-easing/jquery.easing.min.js"></script>
    <script src="/wp-content/themes/startbootstrap-freelancer-gh-pages/vendor/magnific-popup/jquery.magnific-popup.min.js"></script>

    <!-- Contact Form JavaScript -->
    <script src="/wp-content/themes/startbootstrap-freelancer-gh-pages/js/jqBootstrapValidation.js"></script>
    <script src="/wp-content/themes/startbootstrap-freelancer-gh-pages/js/contact_me.js"></script>

    <!-- Custom scripts for this template -->
    <script src="/wp-content/themes/startbootstrap-freelancer-gh-pages/js/freelancer.min.js"></script>

  </body>

</html>

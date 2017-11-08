<?php
/**
 * The template for displaying the contact page
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package _pda
 */

get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main">
			<div class="entry-content">
				<h1>About</h1>
				

					<?php if( get_field('about-copy') ){ ?>
						<?php if( get_field('about-img') ){ ?>

							<!-- about copy with img -->
							<div id="about-content" class=""> <!-- .flex-container -->
								<div class='about-copy w-img'><?php the_field('about-copy'); ?></div>
								<div class='about-img' style='background-image: url("<?php the_field('about-img'); ?>")'></div>
							</div>
						<?php } else { ?>

							<!-- about copy, no img -->
							<div class='about-copy'><?php the_field('about-copy'); ?></div>

						<?php } ?>
					<?php }?>

				
			</div>

		

			<?php
			while ( have_posts() ) : the_post();

				get_template_part( 'template-parts/content', 'page' );

				// If comments are open or we have at least one comment, load up the comment template.
				// if ( comments_open() || get_comments_number() ) :
				// 	comments_template();
				// endif;

			endwhile; // End of the loop.
			?>

		</main><!-- #main -->
	</div><!-- #primary -->

<?php
// get_sidebar();
get_footer();

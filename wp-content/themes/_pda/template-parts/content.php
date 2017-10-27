<?php
/**
 * Template part for displaying posts
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package _pda
 */

?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header">
		<?php
 
		// on post page
		if ( is_singular() ) {
			if ( has_post_thumbnail() ) {
				the_post_thumbnail( 'large' );
			}
			the_title( '<h1 class="entry-title">', '</h1>' );

		// on archive / index page
		} else {
			if ( has_post_thumbnail() ) { ?>
			    <div class="post-box" style="background-image: url('<?php the_post_thumbnail_url(large); ?>');" title="<?php the_title_attribute(); ?>">
			        <div class="post-info">
				        <h2 class="entry-title"><a href='<?php esc_url( the_permalink() )?>' rel="bookmark"><?php the_title(); ?></a></h2>
					    <footer class="entry-footer"><?php _pda_entry_footer(); ?></footer>
				    </div>
				</div>
				<?php edit_post_link(
					sprintf(wp_kses(
					/* translators: %s: Name of current post. Only visible to screen readers */
					__( 'Edit <span class="screen-reader-text">%s</span>', '_pda' ),
					array(
						'span' => array(
							'class' => array(),
						),
					)),get_the_title()),
				'<span class="edit-link">',
				'</span>'
				);
			} // https://developer.wordpress.org/reference/functions/the_post_thumbnail/
			
		}
			

		// if ('post' === get_post_type()) { ?>
			<!-- <div class="entry-meta"> -->
				<?php //_pda_posted_on(); ?> <!--"Posted on October 24 by peterdarthur"-->
			<!-- </div>.entry-meta -->
		<?php // } ?>
	</header><!-- .entry-header -->

	<div class="entry-content">
		<?php if ( is_singular() ) { // only show content on single posts
			the_content( sprintf(
				wp_kses(
					/* translators: %s: Name of current post. Only visible to screen readers */
					__( 'Continue reading<span class="screen-reader-text"> "%s"</span>', '_pda' ),
					array(
						'span' => array(
							'class' => array(),
						),
					)
				),
				get_the_title()
			) );

			wp_link_pages( array(
				'before' => '<div class="page-links">' . esc_html__( 'Pages:', '_pda' ),
				'after'  => '</div>',
			) );
		} ?>
	</div><!-- .entry-content -->

	<?php if ( is_singular() ) {  // only show content on single posts ?>
		<footer class="entry-footer">
			<?php _pda_entry_footer(); 
				
				edit_post_link(
					sprintf(wp_kses(
					/* translators: %s: Name of current post. Only visible to screen readers */
					__( 'Edit <span class="screen-reader-text">%s</span>', '_pda' ),
					array(
						'span' => array(
							'class' => array(),
						),
					)),get_the_title()),
				'<span class="edit-link">',
				'</span>'
				);?>

		</footer><!-- .entry-footer -->
	<?php } ?>
</article><!-- #post-<?php the_ID(); ?> -->

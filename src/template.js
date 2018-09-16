export default (html, css) => (
<div>
  <style type='text/css' dangerouslySetInnerHTML={{__html: css}}/>
  <div dangerouslySetInnerHTML={{__html: html}}/>
</div>
);

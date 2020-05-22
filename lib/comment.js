class Comment {
  constructor(name, time, comment) {
    this.name = name;
    this.time = time;
    this.comment = comment;
  }

  toHtml() {
    return `
      <tr class="comment-row">
        <td class="name"><strong>${this.name}</strong></td>
        <td class="time">${this.time.toLocaleString()}</td>
        <td class="comment"><pre>${this.comment}</pre></td>
      </tr>`;
  }
}

class Comments {
  constructor() {
    this.comments = [];
  }

  addComment(comment) {
    this.comments.push(comment);
  }

  toHtml() {
    const reverseComments = this.comments.slice().reverse();
    return reverseComments.map((comment) => comment.toHtml()).join('');
  }

  static load(content) {
    const commentList = JSON.parse(content || '[]');
    const comments = new Comments();

    commentList.forEach((commentDetail) => {
      const { name, time, comment } = commentDetail;
      comments.addComment(new Comment(name, new Date(time), comment));
    });

    return comments;
  }

  toJSON() {
    return JSON.stringify(this.comments);
  }
}

module.exports = { Comment, Comments };
